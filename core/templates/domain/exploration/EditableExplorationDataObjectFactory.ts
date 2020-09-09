// Copyright 2020 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Factory for creating new frontend instances of editable
 * exploration response objects.
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';

import { ParamChangeBackendDict, ParamChange } from
  'domain/exploration/ParamChangeObjectFactory';
import { ParamChangesObjectFactory } from
  'domain/exploration/ParamChangesObjectFactory';
import { ParamSpecsBackendDict, ParamSpecs, ParamSpecsObjectFactory } from
  'domain/exploration/ParamSpecsObjectFactory';
import { State } from 'domain/state/StateObjectFactory';
import {
  StateObjectsBackendDict,
  VoiceoverObjectsDict,
  States,
  StatesObjectFactory
} from 'domain/exploration/StatesObjectFactory';

import cloneDeep from 'lodash/cloneDeep';

export interface EditableExplorationDataBackendDict {
  'auto_tts_enabled': boolean;
  'category': string;
  'correctness_feedback_enabled': boolean;
  'draft_change_list_id': number;
  'exploration_id': string;
  'init_state_name': string;
  'language_code': string;
  'objective': string;
  'param_changes': ParamChangeBackendDict[];
  'param_specs': ParamSpecsBackendDict;
  'rights': any;
  'show_state_editor_tutorial_on_load': boolean;
  'show_state_translation_tutorial_on_load': boolean,
  'states': StateObjectsBackendDict;
  'tags': string[];
  'title': string;
  'version': number;
  'is_version_of_draft_valid': boolean;
  'draft_changes': any[];
  'email_preferences': any;
  'state_classifier_mapping': any;
}

export class EditableExplorationData {
  autoTtsEnabled: boolean;
  category: string;
  correctnessFeedbackEnabled: boolean;
  draftChangeListId: number;
  explorationId: string;
  initStateName: string;
  languageCode: string;
  objective: string;
  paramChanges: ParamChange[];
  paramSpecs: ParamSpecs;
  rights: any;
  showStateEditorTutorialOnLoad: boolean;
  showStateTranslationTutorialOnLoad: boolean;
  states: States;
  tags: string[];
  title: string;
  version: number;
  isVersionOfDraftValid: boolean;
  draftChanges: any[];
  emailPreferences: any;
  stateClassifierMapping: any;

  constructor(
      autoTtsEnabled: boolean, category: string,
      correctnessFeedbackEnabled: boolean, draftChangeListId: number,
      explorationId: string, initStateName: string, languageCode: string,
      objective: string, paramChanges: ParamChange[], paramSpecs: ParamSpecs,
      rights: any, showStateEditorTutorialOnLoad: boolean,
      showStateTranslationTutorialOnLoad: boolean, states: States,
      tags: string[], title: string, version: number, 
      isVersionOfDraftValid: boolean, draftChanges: any[],
      emailPreferences: any, stateClassifierMapping: any) {
    this.autoTtsEnabled = autoTtsEnabled;
    this.category = category;
    this.correctnessFeedbackEnabled = correctnessFeedbackEnabled;
    this.draftChangeListId = draftChangeListId;
    this.explorationId = explorationId;
    this.initStateName = initStateName;
    this.languageCode = languageCode;
    this.objective = objective;
    this.paramChanges = paramChanges;
    this.paramSpecs = paramSpecs;
    this.rights = rights;
    this.showStateEditorTutorialOnLoad = showStateEditorTutorialOnLoad;
    this.showStateTranslationTutorialOnLoad = showStateTranslationTutorialOnLoad;
    this.states = states;
    this.tags = tags;
    this.title = title;
    this.version = version;
    this.isVersionOfDraftValid = isVersionOfDraftValid;
    this.draftChanges = draftChanges;
    this.emailPreferences = emailPreferences;
    this.stateClassifierMapping = stateClassifierMapping;
  }

  toBackendDict(): EditableExplorationDataBackendDict {
    var stateBackendObjectsDict = {};
    var stateObjectsDict = this.states.getStateObjects();
    for (var stateName in stateObjectsDict) {
      stateBackendObjectsDict[stateName] = stateObjectsDict[stateName].toBackendDict();
    }

    return {
      auto_tts_enabled: this.autoTtsEnabled,
      category: this.category,
      correctness_feedback_enabled: this.correctnessFeedbackEnabled,
      draft_change_list_id: this.draftChangeListId,
      exploration_id: this.explorationId,
      init_state_name: this.initStateName,
      language_code: this.languageCode,
      objective: this.objective,
      param_changes: this.paramChanges.map((paramChange) => {
        return paramChange.toBackendDict();
      }),
      param_specs: this.paramSpecs.toBackendDict(),
      rights: this.rights,
      show_state_editor_tutorial_on_load: this.showStateEditorTutorialOnLoad,
      show_state_translation_tutorial_on_load: this.showStateTranslationTutorialOnLoad,
      states: stateBackendObjectsDict,
      tags: this.tags,
      title: this.title,
      version: this.version,
      is_version_of_draft_valid: this.isVersionOfDraftValid,
      draft_changes: this.draftChanges,
      email_preferences: this.emailPreferences,
      state_classifier_mapping: this.stateClassifierMapping
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class EditableExplorationDataObjectFactory {
  constructor(private paramChangesObjectFactory: ParamChangesObjectFactory,
              private paramSpecsObjectFactory: ParamSpecsObjectFactory,
              private statesObjectFactory: StatesObjectFactory) {}

  createFromBackendDict(
      editableExplorationBackendDict: EditableExplorationDataBackendDict): EditableExplorationData {
    return new EditableExplorationData(
      editableExplorationBackendDict.auto_tts_enabled,
      editableExplorationBackendDict.category,
      editableExplorationBackendDict.correctness_feedback_enabled,
      editableExplorationBackendDict.draft_change_list_id,
      editableExplorationBackendDict.exploration_id,
      editableExplorationBackendDict.init_state_name,
      editableExplorationBackendDict.language_code,
      editableExplorationBackendDict.objective,
      this.paramChangesObjectFactory.createFromBackendList(
        editableExplorationBackendDict.param_changes),
      this.paramSpecsObjectFactory.createFromBackendDict(
        editableExplorationBackendDict.param_specs),
      editableExplorationBackendDict.rights,
      editableExplorationBackendDict.show_state_editor_tutorial_on_load,
      editableExplorationBackendDict.show_state_translation_tutorial_on_load,
      this.statesObjectFactory.createFromBackendDict(
        editableExplorationBackendDict.states),
      editableExplorationBackendDict.tags,
      editableExplorationBackendDict.title,
      editableExplorationBackendDict.version,
      editableExplorationBackendDict.is_version_of_draft_valid,
      editableExplorationBackendDict.draft_changes,
      editableExplorationBackendDict.email_preferences,
      editableExplorationBackendDict.state_classifier_mapping);
  }
}

angular.module('oppia').factory(
  'EditableExplorationDataObjectFactory',
  downgradeInjectable(EditableExplorationDataObjectFactory));