import { get } from './lang';

describe('lang.get', () => {
  test('deep pick', () => {
    expect(
      get({
        a: {
          b: {
            c: 'test'
          }
        }
      }, 'a.b.c')
    ).toBe('test');
  })

  test('nully pick', () => {
    expect(
      get({
        a: {
          b: {
            c: 'test'
          }
        }
      }, 'a.b.c.d')
    ).toBe(undefined);
  })

  test('self pick', () => {
    expect(
      get({
        a: 'test'
      }, undefined)
    ).toEqual({
      a: "test"
    });
  })

  test('* pick', () => {
    expect(
      get({
        a: [
          { a: 1 },
          { a: 2 },
          { a: 3 },
        ]
      }, 'a.*.a')
    ).toEqual([1, 2, 3])
  })

  test('nully * pick', () => {
    expect(
      get({
        a: [
          { a: 1 },
          { a: 2 },
          { a: 3 },
        ]
      }, 'b.*.a')
    ).toEqual(undefined)
  })
})