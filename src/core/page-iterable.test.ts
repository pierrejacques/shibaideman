import { PageIterable } from './page-iterable';

describe('PageIterable', () => {
  test('Plain URL iteration', () => {
    const urls = [
      "https://www.dummy.com/page1",
      "https://www.dumb.com/page2",
      "https://www.dummy.com/page3/haha",
      "https://www.dummy.com/page4",
    ];
    const iterator = new PageIterable({
      urls,
    });

    const iterated = Array.from(iterator);

    expect(iterated).toEqual(urls);
  });

  test("Template URL iteration", () => {
    const keyword = [
      'foo',
      'bar',
      'til'
    ];
    const page = [
      '1',
      '2'
    ]

    const iterator = new PageIterable({
      urls: [
        {
          template: 'https://www.dummy.com?q={keyword}&page={page}&from=share',
          source: {
            keyword,
            page,
          }
        }
      ]
    });

    const set = new Set(iterator);

    for (const k of keyword) {
      for (const p of page) {
        const url = `https://www.dummy.com?q=${k}&page=${p}&from=share`;
        expect(set.has(url)).toBeTruthy();
      }
    }
  })
});
