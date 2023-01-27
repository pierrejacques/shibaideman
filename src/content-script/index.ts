import { postItemMessagePorta } from "@/portas/message";

const selectors = {
  desc: '.lemma-desc',
  input: '#query',
  multiClue: '.lemmaWgt-subLemmaListTitle',
  multiDescLink: '.para a',
}

async function run() {
  window.addEventListener('load', () => {
    let desc: string;
    if (document.querySelector(selectors.multiClue)) {
      const anchor = document.querySelector(selectors.multiDescLink);
      const raw = anchor.innerHTML;
      const commaIndex = raw.indexOf('：');
      desc = commaIndex !== -1 ? raw.slice(commaIndex + 1) : raw;
    } else {
      const descNode = document.querySelector(selectors.desc);
      if (descNode) {
        desc = descNode.innerHTML;
      }
    }

    if (desc) {
      const titleNode: HTMLInputElement = document.querySelector(selectors.input);
      postItemMessagePorta.push({
        desc,
        search: titleNode.value,
      });
    }
    window.close();
  })
  setTimeout(() => {
    window.close();
  }, 10000);
};

run();
