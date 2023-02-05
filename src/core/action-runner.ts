import { Action, LoopCondition } from "@/interface";
import { assign, isString, last, timeout } from "@/util/lang";
import { isHTMLElement, isSVGElement } from '@/util/dom';

export class ActionRunner {
  private static testCondition(condition: LoopCondition, ctx: {
    count: number;
    node: ParentNode;
  }) {
    if ('forCount' in condition) {
      return ctx.count < condition.forCount;
    } else if ('whileSelector' in condition) {
      return !!ctx.node.querySelector(condition.whileSelector);
    } else {
      return !ctx.node.querySelector(condition.tillSelector);
    }
  }

  private actions: Action[];

  private isRunning = false;

  constructor(actions: Action[]) {
    this.actions = actions;
  }

  public async run() {
    if (this.isRunning) {
      throw new Error('Busy: Actions already on the run');
    };
    this.isRunning = true;

    const obj: Record<string, any> = {};

    await this.runActions(document, obj, this.actions);

    return obj;
  }

  public cancel() {
    this.isRunning = false;
  }

  private async runActions(node: ParentNode, obj: Record<string, any>, actions: Action[]) {
    const loopStack: {
      startIndex: number;
      count: number;
      condition: LoopCondition;
    }[] = []; // [position, count][];

    let index = 0;

    while (index < actions.length) {
      if (!this.isRunning) return;

      const action = actions[index];
      index += 1;

      switch (action.type) {
        case 'delay':
          await timeout(action.ms);
          break;
        case 'event': {
          const target = node.querySelector(action.selector);
          if (isHTMLElement(target)) {
            target[action.event]();
          }
          break;
        }
        case 'capture': {
          for (const [field, targetQuery] of Object.entries(action.fields)) {
            const { selector, attr } = isString(targetQuery) ? {
              selector: targetQuery,
              attr: '',
            } : targetQuery;

            const target = selector ?
              node.querySelector(selector) :
              node;

            if (attr) {
              if (isHTMLElement(target) || isSVGElement(target)) {
                assign(obj, field, target.getAttribute(attr));
              }
            } else {
              if (isHTMLElement(target)) {
                assign(obj, field, target.innerText);
              }
            }
          }
          break;
        }
        case 'loop':
          loopStack.push({
            startIndex: index,
            count: 0,
            condition: action.condition,
          });
          break;
        case 'loop-end': {
          const loop = last(loopStack);
          if (loop) {
            loop.count++;
            const { startIndex, count, condition } = loop;

            if (startIndex + 1 < index && ActionRunner.testCondition(condition, {
              count,
              node,
            })) {
              // loop
              index = startIndex + 1;
            }
          }
          break;
        }
        case 'children': {
          const arr = [];
          const { field, selector, actions } = action;

          if (field) {
            assign(obj, field, arr);
          }

          for (const target of node.querySelectorAll(selector)) {
            if (isHTMLElement(target)) {
              let nextObj = obj;

              if (field) {
                nextObj = {};
                arr.push(nextObj);
              }

              await this.runActions(target, nextObj, actions);
            }
          }
        }
        default:
          break;
      }
    }
  }
}