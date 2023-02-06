import { stringify as stringifyCSV } from 'csv-stringify/lib/sync';
import { parse as parseCSV } from 'csv-parse/lib/sync';
import { ConvertableFormat, ConvertConfig } from "@/interface";
import { assign, get } from './lang';

type GenericTableLikeRow = Record<string, any>;

const assets: Record<ConvertableFormat, {
  createIterable(raw: string): Iterable<GenericTableLikeRow>;
  stringify(rows: GenericTableLikeRow[], cols: string[]): string;
}> = {
  json: {
    createIterable(raw) {
      const arr: GenericTableLikeRow[] = JSON.parse(raw);
      if (!Array.isArray(arr)) throw new Error('input must be an array');

      return {
        *[Symbol.iterator]() {
          for (const item of arr) {
            yield item;
          }
        }
      };
    },
    stringify(rows) {
      return JSON.stringify(rows);
    }
  },
  csv: {
    createIterable(raw) {
      const arr: Iterable<GenericTableLikeRow> = parseCSV(raw, {
        columns: true,
        skip_empty_lines: true
      });
      //
      return {
        *[Symbol.iterator]() {
          for (const item of arr) {
            yield item;
          }
        }
      }
    },
    stringify(rows, cols) {
      const flattenRows = rows.map(
        item => cols.map(col => item[col] ?? "")
      );

      return stringifyCSV([cols, ...flattenRows]);
    }
  }
}

export function convertTableLike({ from, to, mapping }: ConvertConfig, input: string): string {
  const rows: GenericTableLikeRow[] = [];
  const iterable = assets[from].createIterable(input);

  const pairs = Object.entries(mapping);

  for (const row of iterable) {
    const mappedRow: GenericTableLikeRow = {};

    pairs.forEach(([toPath, fromPath]) => {
      const value = get(row, fromPath);
      const strValue = Array.isArray(value) ? value.flat(3).join(',') : value;
      assign(mappedRow, toPath, strValue);
    });

    rows.push(mappedRow);
  }

  return assets[to].stringify(rows, pairs.map(([col]) => col));
}
