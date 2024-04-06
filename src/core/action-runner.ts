import { Action, LoopCondition, MaybeResult, TargetQuery } from "@/interface";
import { assign, isString, last, timeout } from "@/utils/lang";
import { isHTMLElement, isSVGElement } from '@/utils/dom';
import { ResultCode } from "@/enum";
import { INTERRUPT_ERROR } from "@/const";

interface RuntimeContext {
  hasCaptureAction: boolean;
  hasCaptued: boolean;
}

export function queryTarget(node: ParentNode, targetQuery: TargetQuery) {
  const { selector, attr, flag = '' } = isString(targetQuery) ? {
    selector: targetQuery,
    attr: '',
  } : targetQuery;

  const target = selector ?
    node.querySelector(selector) :
    node;

  let rVal: string;

  if (attr) {
    if (isHTMLElement(target) || isSVGElement(target)) {
      rVal = target.getAttribute(attr);
    }
  } else {
    if (isHTMLElement(target)) {
      rVal = target.innerText;
    }
  }

  return rVal != null ? flag || rVal : undefined;
}

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

  public async run(): Promise<MaybeResult> {
    if (this.isRunning) {
      throw new Error('Busy: Actions already on the run');
    };
    this.isRunning = true;

    const data: Record<string, any> = {};

    const context: RuntimeContext = {
      hasCaptureAction: false,
      hasCaptued: false,
    }

    await this.runActions(document, data, this.actions, context);

    return {
      data,
      code: context.hasCaptureAction && !context.hasCaptued ?
        ResultCode.Void :
        ResultCode.Success
    };
  }

  public cancel() {
    this.isRunning = false;
  }

  private async runActions(
    node: ParentNode,
    obj: Record<string, any>,
    actions: Action[],
    context: RuntimeContext,
  ) {
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
          context.hasCaptureAction = true;
          for (const [field, targetQueryMaybeList] of Object.entries(action.fields)) {
            const targetQueryList = Array.isArray(targetQueryMaybeList) ? targetQueryMaybeList : [targetQueryMaybeList];

            for (const targetQuery of targetQueryList) {
              const value = queryTarget(node, targetQuery);

              if (value != null) {
                context.hasCaptued = true;
                assign(obj, field, value);
                break;
              }
            }
          }
          break;
        }
        case 'interrupt': {
          const value = queryTarget(node, action.selector);
          if (value != null) {
            throw new Error(INTERRUPT_ERROR);
          }
          break;
        };
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

              await this.runActions(target, nextObj, actions, context);
            }
          }
        }
        default:
          break;
      }
    }
  }
}