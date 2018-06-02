
sinon = require "sinon"
{ FakePromise } = require "fake-promise"

{ Loader } = require "./Loader"
{ Layout, Include, Page } = require "../model"

describe "Loader", ->
  config =
    title: "test"
    timezone: "UTC"
    collections: []
    baseUrl: "http://paramorph.github.io/"
    image: ""
    locale: "en_US"
    menu: []
  mocks =
    projectStructure:
      scan: sinon.stub()
    frontMatter:
      read: sinon.stub()
    pageFactory:
      create: sinon.stub()

  testedLoader = null
  paramorph = null

  beforeEach ->
    testedLoader = new Loader mocks.projectStructure, mocks.frontMatter, mocks.pageFactory
  afterEach ->
    mocks.projectStructure.scan.resetBehavior()
    mocks.projectStructure.scan.resetHistory()
    mocks.frontMatter.read.resetBehavior()
    mocks.frontMatter.read.resetHistory()
    mocks.pageFactory.create.resetBehavior()
    mocks.pageFactory.create.resetHistory()

  describe "when loading empty project structure", ->
    struct =
      layouts: []
      includes: []
      collections: {}

    beforeEach ->
      mocks.projectStructure.scan.returns FakePromise.resolve struct
      paramorph = await testedLoader.load config

    it ".load() returns empty Paramorph instance", ->
      paramorph.layouts.should.eql {}
      paramorph.includes.should.eql {}
      paramorph.pages.should.eql {}
      paramorph.categories.should.eql {}
      paramorph.tags.should.eql {}
      paramorph.config.should.eql config

  describe "when loading a project structure containing layouts", ->
    struct =
      layouts: [
        name: "default"
        path: "./_layouts/default.ts"
      ]
      includes: []
      collections: {}

    beforeEach ->
      mocks.projectStructure.scan.returns FakePromise.resolve struct
      paramorph = await testedLoader.load config

    it ".load() returns Paramorph containing layouts", ->
      Object.keys(paramorph.layouts).should.have.length 1
      paramorph.layouts.default.should.eql new Layout "default", "./_layouts/default.ts"

  describe "when loading a project structure containing includes", ->
    struct =
      layouts: [
      ]
      includes: [
        name: "Feed"
        path: "./_includes/Feed.ts"
      ]
      collections: {}

    beforeEach ->
      mocks.projectStructure.scan.returns FakePromise.resolve struct
      paramorph = await testedLoader.load config

    it ".load() returns Paramorph containing includes", ->
      Object.keys(paramorph.includes).should.have.length 1
      paramorph.includes.Feed.should.eql new Include "Feed", "./_includes/Feed.ts"

  describe "when loading a project structure containing page", ->
    postSource =
      name: "hello-world"
      path: "./_post/hello-world.md"
    struct =
      layouts: [
      ]
      includes: [
      ]
      collections:
        posts: [
          postSource
        ]
    matterPromise = null
    paramorphPromise = null

    beforeEach (end) ->
      mocks.projectStructure.scan.returns FakePromise.resolve struct
      matterPromise = new FakePromise
      mocks.frontMatter.read.returns matterPromise
      paramorphPromise = testedLoader.load config
      setImmediate end

    it "calls frontMatter.read(...)", ->
      mocks.frontMatter.read.should.have.callCount 1
        .and.have.been.calledWith postSource

    describe "and after resolving frontMatter promise", ->
      matter =
        title: "Hello, World!"
        description: "Just a first post."
      page = new Page(
        "/hello-world"
        "Hello, World!"
        "Just a first post."
        null
        "posts"
        "default"
        "./_post/hello-world.md"
        true
        true
        []
        []
        0
      )

      beforeEach (end) ->
        mocks.pageFactory.create.returns page
        matterPromise.resolve matter
        setImmediate end

      it 'calls pageFactory.create(...)', ->
        mocks.pageFactory.create.should.have.callCount 1
          .and.have.been.calledWith postSource, "posts", matter

      it "resolves paramorph containing the page", ->
        paramorphPromise
          .then (paramorph) ->
            paramorph.pages.should.have.property "/hello-world"
              .which.equal page

