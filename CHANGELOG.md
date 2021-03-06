# Changelog

## 2.0.0

- View: allowed to specify type of rendered Element
- View: allowed to set DOM event handlers on a root element
- CollectionView: added default implementation for "getHTML()" method returning simple "div" element
- CollectionView: allowed not to specify EmptyView when it's not used
- CollectionView: allowed to render Views inside of specified child Element
- CollectionView: EmptyView is automatically removed on "addChildView()" calls
- CollectionView: allowed to be instantiated without inheritance
- CollectionView: call beforeInit/afterInit on ModelView when several children added
- CollectionView: allow to specify desired position of ModelViews
- Documentation: improve example usage of "OsfObservable.retrigger()" method
- Documentation: added "async" prefix to examples of View method usages
- Documentation: fixed formatting in various code examples
