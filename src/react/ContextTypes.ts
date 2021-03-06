
import * as React from 'react';
import * as PropTypes from 'prop-types';

export const ContextTypes = {
  paramorph: PropTypes.shape({
    layouts: PropTypes.object.isRequired,
    includes: PropTypes.object.isRequired,
    posts: PropTypes.object.isRequired,
    categories: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    listen: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  post: PropTypes.shape({
    url: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
    collection: PropTypes.string.isRequired,
    layout: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    output: PropTypes.bool.isRequired,
    feed: PropTypes.bool.isRequired,
    categories: PropTypes.array.isRequired,
    tags: PropTypes.array.isRequired,
    timestamp: PropTypes.number.isRequired,
  }).isRequired,
  pathParams : PropTypes.shape({
    set: PropTypes.func.isRequired,
    get: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    once: PropTypes.func.isRequired,
    removeListener: PropTypes.func.isRequired,
    removeAllListeners: PropTypes.func.isRequired,
  }),
  requestParameterizedRender: (
    PropTypes.func.isRequired
  ),
};

export default ContextTypes;

