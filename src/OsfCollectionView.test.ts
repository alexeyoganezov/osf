import * as sinon from 'sinon';

import {
  MODEL_ADDED_EVENT,
  OsfCollection,
  OsfCollectionView,
  OsfInsertPosition,
  OsfModel,
  OsfModelView,
  OsfReference,
  OsfView,
} from './index';

interface IArticle {
  title: string;
  description: string;
}

class ArticleModel extends OsfModel<IArticle> {

}

class ArticleView extends OsfModelView<ArticleModel> {
  getHTML(): string {
    const preview = this.model.attrs;
    return `
        <div>
          <h1>${preview.title}</h1>
          <p>${preview.description}</p>
        </div>
      `;
  }

  public triggerTestEvent() {
    this.trigger('test');
  }
}

class NoArticlesView extends OsfView {
  getHTML(): string {
    return `
      <div>No articles</div>
    `;
  }
}

class ArticlesView extends OsfCollectionView<ArticleModel, ArticleView, NoArticlesView> {
  getHTML(): string {
    return '<div class="articles"></div>';
  }
}

test('OsfCollectionView renders all models', async () => {
  const collection = new OsfCollection([
    new ArticleModel({ title: 'One', description: 'Hello' }),
    new ArticleModel({ title: 'Two', description: 'World' }),
  ]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  // First view
  expect(view.el?.children[0].children[0].tagName).toBe('H1');
  expect(view.el?.children[0].children[0].textContent).toBe('One');
  expect(view.el?.children[0].children[1].tagName).toBe('P');
  expect(view.el?.children[0].children[1].textContent).toBe('Hello');
  // Second view
  expect(view.el?.children[1].children[0].tagName).toBe('H1');
  expect(view.el?.children[1].children[0].textContent).toBe('Two');
  expect(view.el?.children[1].children[1].tagName).toBe('P');
  expect(view.el?.children[1].children[1].textContent).toBe('World');
});

test('OsfCollectionView can be used without inheritance', async () => {
  const collection = new OsfCollection([
    new ArticleModel({ title: 'One', description: 'Hello' }),
    new ArticleModel({ title: 'Two', description: 'World' }),
  ]);
  const view = new OsfCollectionView(collection, ArticleView, NoArticlesView);
  await view.init();
  // First view
  expect(view.el?.children[0].children[0].tagName).toBe('H1');
  expect(view.el?.children[0].children[0].textContent).toBe('One');
  expect(view.el?.children[0].children[1].tagName).toBe('P');
  expect(view.el?.children[0].children[1].textContent).toBe('Hello');
  // Second view
  expect(view.el?.children[1].children[0].tagName).toBe('H1');
  expect(view.el?.children[1].children[0].textContent).toBe('Two');
  expect(view.el?.children[1].children[1].tagName).toBe('P');
  expect(view.el?.children[1].children[1].textContent).toBe('World');
});

test('OsfCollectionView renders emptyView if no model presented', async () => {
  const collection = new OsfCollection<ArticleModel>();
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  expect(view.el && view.el.children[0].tagName).toBe('DIV');
  expect(view.el && view.el.children[0].textContent).toBe('No articles');
});

test('OsfCollectionView removes EmptyView on ChildView adding', async () => {
  const collection = new OsfCollection<ArticleModel>();
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  await view.addChildView([
    new ArticleModel({ title: 'one', description: 'two' }),
    new ArticleModel({ title: 'three', description: 'four' })
  ]);
  // Check children count
  expect(view.el && view.el.children.length).toBe(2);
  // Check first rendered View
  expect(view.el?.children[0].children[0].tagName).toBe('H1');
  expect(view.el?.children[0].children[0].textContent).toBe('one');
  expect(view.el?.children[0].children[1].tagName).toBe('P');
  expect(view.el?.children[0].children[1].textContent).toBe('two');
});

test('OsfCollectionView can perform sorting', async () => {
  class ArticlesView extends OsfCollectionView<ArticleModel, ArticleView, NoArticlesView> {
    getHTML(): string {
      return '<div class="articles"></div>';
    }
  }
  const collection = new OsfCollection([
    new ArticleModel({ title: 'aaa', description: 'aaa' }),
    new ArticleModel({ title: 'bbb', description: 'bbb' }),
  ]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  view.sortFunc = (models) => models.reverse();
  await view.init();
  // First view
  expect(view.el?.children[0].children[0].tagName).toBe('H1');
  expect(view.el?.children[0].children[0].textContent).toBe('bbb');
  expect(view.el?.children[0].children[1].tagName).toBe('P');
  expect(view.el?.children[0].children[1].textContent).toBe('bbb');
  // Second view
  expect(view.el?.children[1].children[0].tagName).toBe('H1');
  expect(view.el?.children[1].children[0].textContent).toBe('aaa');
  expect(view.el?.children[1].children[1].tagName).toBe('P');
  expect(view.el?.children[1].children[1].textContent).toBe('aaa');
});

test('OsfCollectionView can perform filtering', async () => {
  const collection = new OsfCollection([
    new ArticleModel({ title: 'aaa', description: 'aaa' }),
    new ArticleModel({ title: 'bbb', description: 'bbb' }),
  ]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  view.filterFunc = (models) => models.filter((m) => m.attrs.title !== 'aaa');
  await view.init();
  expect(view.el?.children.length).toBe(1);
  expect(view.el?.children[0].children[0].tagName).toBe('H1');
  expect(view.el?.children[0].children[0].textContent).toBe('bbb');
  expect(view.el?.children[0].children[1].tagName).toBe('P');
  expect(view.el?.children[0].children[1].textContent).toBe('bbb');
});

test('OsfCollectionView handles collectionEvents', async () => {
  const callback = sinon.fake();
  class ArticlesView extends OsfCollectionView<ArticleModel, ArticleView, NoArticlesView> {
    getHTML(): string {
      return '<div class="articles"></div>';
    }
    collectionEvents = [
      { on: MODEL_ADDED_EVENT, call: this.handleAdd },
    ];
    handleAdd() {
      callback();
    }
  }
  const collection = new OsfCollection([
    new ArticleModel({ title: 'aaa', description: 'aaa' }),
  ]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  collection.add(new ArticleModel({
    title: 'bbb',
    description: 'bbb',
  }));
  expect(callback.callCount).toBe(1);
});

test('OsfCollectionView calls beforeInit/afterInit', async () => {
  const beforeInit = sinon.fake();
  const afterInit = sinon.fake();
  class ArticlesView extends OsfCollectionView<ArticleModel, ArticleView, NoArticlesView> {
    getHTML(): string {
      return '<div class="articles"></div>';
    }
    beforeInit(): void {
      beforeInit();
    }
    afterInit(): void {
      afterInit();
    }
  }
  const collection = new OsfCollection([
    new ArticleModel({ title: 'aaa', description: 'aaa' }),
  ]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  expect(beforeInit.callCount).toBe(1);
  expect(afterInit.callCount).toBe(1);
});

test('OsfCollectionView calls beforeInit/afterInit on child Views', async () => {
  const beforeInit = sinon.fake();
  const afterInit = sinon.fake();
  class ArticleView extends OsfModelView<ArticleModel> {
    getHTML(): string {
      const preview = this.model.attrs;
      return `
        <div>
          <h1>${preview.title}</h1>
        </div>
      `;
    }
    beforeInit(): void {
      beforeInit();
    }
    afterInit(): void {
      afterInit();
    }
  }
  class ArticlesView extends OsfCollectionView<ArticleModel, ArticleView, NoArticlesView> {
    getHTML(): string {
      return '<div class="articles"></div>';
    }
  }
  const collection = new OsfCollection<ArticleModel>();
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  await view.addChildView([
    new ArticleModel({ title: 'One', description: 'Hello' }),
  ]);
  expect(beforeInit.callCount).toBe(1);
  expect(afterInit.callCount).toBe(1);
});

test('OsfCollectionView handles viewEvents', async () => {
  const callback = sinon.fake();
  class ArticlesView extends OsfCollectionView<ArticleModel, ArticleView, NoArticlesView> {
    getHTML(): string {
      return '<div class="articles"></div>';
    }
    viewEvents = [
      { on: 'test', call: this.handleTest },
    ];
    handleTest() {
      callback();
    }
  }
  const collection = new OsfCollection([
    new ArticleModel({ title: 'aaa', description: 'aaa' }),
  ]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  expect(callback.callCount).toBe(0);
  // @ts-ignore
  view.children[0].triggerTestEvent();
  expect(callback.callCount).toBe(1);
});

test('OsfCollectionView can be used without EmptyView', async () => {
  class ArticlesView extends OsfCollectionView<ArticleModel, ArticleView> {
    getHTML(): string {
      return '<div class="articles"></div>';
    }
  }
  const collection = new OsfCollection<ArticleModel>([]);
  const view = new ArticlesView(collection, ArticleView);
  await view.init();
  expect(view.el?.children.length).toBe(0);
});

test('OsfCollectionView can render View inside of child Element', async () => {
  class ArticlesView extends OsfCollectionView<ArticleModel, ArticleView, NoArticlesView> {
    getHTML(): string {
      return `
        <div class="articles">
          <p>Before</p>
          <div class="actual-list"></div>
          <p>After</p>
        </div>
      `;
    }
    childViewContainer = new OsfReference(this, '.actual-list');
  }
  const collection = new OsfCollection([
    new ArticleModel({ title: 'One', description: 'Hello' }),
    new ArticleModel({ title: 'Two', description: 'World' }),
  ]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  // First view
  expect(view.el?.children[1].children[0].children[0].tagName).toBe('H1');
  expect(view.el?.children[1].children[0].children[0].textContent).toBe('One');
  expect(view.el?.children[1].children[0].children[1].tagName).toBe('P');
  expect(view.el?.children[1].children[0].children[1].textContent).toBe('Hello');
  // Second view
  expect(view.el?.children[1].children[1].children[0].tagName).toBe('H1');
  expect(view.el?.children[1].children[1].children[0].textContent).toBe('Two');
  expect(view.el?.children[1].children[1].children[1].tagName).toBe('P');
  expect(view.el?.children[1].children[1].children[1].textContent).toBe('World');
});

test('OsfCollectionView can add a ModelView to the beginning', async () => {
  const collection = new OsfCollection([
    new ArticleModel({ title: 'Two', description: 'World' }),
  ]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  await view.addChildView(new ArticleModel({ title: 'One', description: 'Hello' }), OsfInsertPosition.Beginning);
  // First view
  expect(view.el?.children[0].children[0].tagName).toBe('H1');
  expect(view.el?.children[0].children[0].textContent).toBe('One');
  expect(view.el?.children[0].children[1].tagName).toBe('P');
  expect(view.el?.children[0].children[1].textContent).toBe('Hello');
  // Second view
  expect(view.el?.children[1].children[0].tagName).toBe('H1');
  expect(view.el?.children[1].children[0].textContent).toBe('Two');
  expect(view.el?.children[1].children[1].tagName).toBe('P');
  expect(view.el?.children[1].children[1].textContent).toBe('World');
});

test('OsfCollectionView can add ModelViews to the beginning', async () => {
  class ArticlesView extends OsfCollectionView<ArticleModel, ArticleView, NoArticlesView> {
    getHTML(): string {
      return '<div class="articles"></div>';
    }
  }
  const collection = new OsfCollection([
    new ArticleModel({ title: 'Two', description: 'World' }),
  ]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  await view.addChildView([
    new ArticleModel({ title: 'One', description: 'Hello' }),
  ], OsfInsertPosition.Beginning);
  // First view
  expect(view.el?.children[0].children[0].tagName).toBe('H1');
  expect(view.el?.children[0].children[0].textContent).toBe('One');
  expect(view.el?.children[0].children[1].tagName).toBe('P');
  expect(view.el?.children[0].children[1].textContent).toBe('Hello');
  // Second view
  expect(view.el?.children[1].children[0].tagName).toBe('H1');
  expect(view.el?.children[1].children[0].textContent).toBe('Two');
  expect(view.el?.children[1].children[1].tagName).toBe('P');
  expect(view.el?.children[1].children[1].textContent).toBe('World');
});

test('OsfCollectionView can add a ModelView right before another one', async () => {
  const modelOne = new ArticleModel({ title: 'One', description: '1' });
  const modelTwo = new ArticleModel({ title: 'Two', description: '2' });
  const modelThree = new ArticleModel({ title: 'Three', description: '3' });
  const collection = new OsfCollection([modelOne, modelThree]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  await view.addChildView(modelTwo, OsfInsertPosition.Before, modelThree);
  expect(view.el?.children[0].children[0].textContent).toBe('One');
  expect(view.el?.children[1].children[0].textContent).toBe('Two');
  expect(view.el?.children[2].children[0].textContent).toBe('Three');
});

test('OsfCollectionView can add ModelViews right before another one', async () => {
  const modelOne = new ArticleModel({ title: 'One', description: '1' });
  const modelTwo = new ArticleModel({ title: 'Two', description: '2' });
  const modelThree = new ArticleModel({ title: 'Three', description: '3' });
  const modelFour = new ArticleModel({ title: 'Four', description: '4' });
  const collection = new OsfCollection([modelOne, modelFour]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  await view.addChildView([modelTwo, modelThree], OsfInsertPosition.Before, modelFour);
  expect(view.el?.children[0].children[0].textContent).toBe('One');
  expect(view.el?.children[1].children[0].textContent).toBe('Two');
  expect(view.el?.children[2].children[0].textContent).toBe('Three');
  expect(view.el?.children[3].children[0].textContent).toBe('Four');
});

test('OsfCollectionView can add a ModelView right after another one', async () => {
  const modelOne = new ArticleModel({ title: 'One', description: '1' });
  const modelTwo = new ArticleModel({ title: 'Two', description: '2' });
  const modelThree = new ArticleModel({ title: 'Three', description: '3' });
  const collection = new OsfCollection([modelOne, modelThree]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  await view.addChildView(modelTwo, OsfInsertPosition.After, modelOne);
  expect(view.el?.children[0].children[0].textContent).toBe('One');
  expect(view.el?.children[1].children[0].textContent).toBe('Two');
  expect(view.el?.children[2].children[0].textContent).toBe('Three');
});

test('OsfCollectionView can add ModelViews right after another one', async () => {
  const modelOne = new ArticleModel({ title: 'One', description: '1' });
  const modelTwo = new ArticleModel({ title: 'Two', description: '2' });
  const modelThree = new ArticleModel({ title: 'Three', description: '3' });
  const modelFour = new ArticleModel({ title: 'Four', description: '4' });
  const collection = new OsfCollection([modelOne, modelFour]);
  const view = new ArticlesView(collection, ArticleView, NoArticlesView);
  await view.init();
  await view.addChildView([modelTwo, modelThree], OsfInsertPosition.After, modelOne);
  expect(view.el?.children[0].children[0].textContent).toBe('One');
  expect(view.el?.children[1].children[0].textContent).toBe('Two');
  expect(view.el?.children[2].children[0].textContent).toBe('Three');
  expect(view.el?.children[3].children[0].textContent).toBe('Four');
});

test.todo('OsfCollectionView can add ModelView');

test.todo('OsfCollectionView can remove ModelView');

test.todo('OsfCollectionView can remove all ModelViews');
