// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Clearing-house for rich-text-component utilities for
 * protractor tests.
 */

// NOTE to devs: If this constant is renamed, make sure to edit
// components_test.ComponentE2eTests.test_component_e2e_tests to search for the
// correct constant name.
var RICH_TEXT_COMPONENTS = {
  Collapsible: require('./Collapsible/protractor.js'),
  Image: require('./Image/protractor.js'),
  Link: require('./Link/protractor.js'),
  Math: require('./Math/protractor.js'),
  Skillreview: require('./Skillreview/protractor.js'),
  Svgdiagram: require('./Svgdiagram/protractor.js'),
  Tabs: require('./Tabs/protractor.js'),
  Video: require('./Video/protractor.js')
};

var getComponent = function(componentName) {
  if (RICH_TEXT_COMPONENTS.hasOwnProperty(componentName)) {
    return RICH_TEXT_COMPONENTS[componentName];
  } else {
    throw new Error('Unknown rich-text component: ' + componentName);
  }
};

exports.RICH_TEXT_COMPONENTS = RICH_TEXT_COMPONENTS;
exports.getComponent = getComponent;
