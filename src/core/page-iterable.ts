import { Pages, UrlInfo } from "@/interface";
import { isString } from "@/util/lang";

export class PageIterable implements Iterable<UrlInfo> {
  private static * traverseIndex(maxs: number[]): Generator<number[]> {
    const [head, ...rest] = maxs;

    for (let i = 0; i < head; i++) {
      if (rest.length) {
        const restIterator = this.traverseIndex(rest);
        for (const restValue of restIterator) {
          yield [i, ...restValue];
        }
      } else {
        yield [i];
      }
    }
  }

  constructor(private pages: Pages) { }

  *[Symbol.iterator]() {
    for (const url of this.pages.urls) {
      const { template, source } = typeof url === 'string' ? {
        template: url,
        source: null,
      } : url;

      // fields
      const fields: {
        name: string;
        values: string[];
      }[] = [];

      type ValueRef = {
        value: string;
        name: string;
      };

      const fieldValueRefs: Record<string, ValueRef> = {};

      const parts: (string | ValueRef)[] = [];

      let strIndex = 0;
      const regex = /\{([^\][]+?)\}/g;
      while (true) {
        const match = regex.exec(template);

        if (!match) {
          parts.push(template.slice(strIndex));
          break;
        };

        const name = match[1];
        const { index: matchStartIndex } = match;
        const values = source?.[name];

        if (!fieldValueRefs[name] && Array.isArray(values) && values.length) {
          parts.push(template.slice(strIndex, matchStartIndex));
          strIndex = matchStartIndex + name.length + 2; // the brackets

          fields.push({
            name,
            values,
          });

          const ref: ValueRef = {
            value: null,
            name,
          };
          fieldValueRefs[name] = ref;
          parts.push(ref);
        }
      }

      if (!fields.length) {
        yield { url: template };
      } else {
        const indexesIterator = PageIterable.traverseIndex(
          fields.map(({ values }) => values.length)
        );

        for (const indexes of indexesIterator) {

          // update the values according to the indexes
          indexes.forEach((index, i) => {
            const { name, values } = fields[i];
            fieldValueRefs[name].value = values[index];
          });

          const url = parts.map(part => isString(part) ? part : part.value).join('');
          const query: Record<string, string> = Object.fromEntries(
            parts.filter(item => !isString(item)).map(
              ({ name, value }: ValueRef) => [name, value]
            )
          );

          yield { url, query };
        }
      }
    }
  }
}
