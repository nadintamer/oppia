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
 * @fileoverview Factory for creating new frontend instances of read only
 * exploration response objects.
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';

import { Exploration, ExplorationObjectFactory, ExplorationBackendDict } from
  'domain/exploration/ExplorationObjectFactory';
import { StateClassifierMappingBackendDict } from
  'pages/exploration-player-page/services/state-classifier-mapping.service.ts';
import { UrlInterpolationService } from
  'domain/utilities/url-interpolation.service';
import { ParamChangeBackendDict, ParamChange } from
  'domain/exploration/ParamChangeObjectFactory';
import {
  StateObjectsBackendDict,
  VoiceoverObjectsDict,
  States,
  StatesObjectFactory
} from 'domain/exploration/StatesObjectFactory';

import cloneDeep from 'lodash/cloneDeep';

export interface ReadOnlyExplorationDataBackendDict {
  'auto_tts_enabled': boolean;
  'can_edit': boolean;
  'correctness_feedback_enabled': boolean;
  'exploration': ExplorationBackendDict;
  'exploration_id': string;
  'is_logged_in': boolean;
  'session_id': string;
  'version': number;
  'preferred_audio_language_code': string;
  'state_classifier_mapping': StateClassifierMappingBackendDict,
  'record_playthrough_probability': number;
}

export class ReadOnlyExplorationData {
  autoTtsEnabled: boolean;
  canEdit: boolean;
  correctnessFeedbackEnabled: boolean;
  exploration: Exploration;
  explorationId: string;
  isLoggedIn: boolean;
  sessionId: string;
  version: number;
  preferredAudioLanguageCode: string;
  stateClassifierMapping: StateClassifierMappingBackendDict;
  recordPlaythroughProbability: number;

  constructor(
      autoTtsEnabled: boolean, canEdit: boolean,
      correctnessFeedbackEnabled: boolean, exploration: Exploration,
      explorationId: string, isLoggedIn: boolean, sessionId: string,
      version: number, preferredAudioLanguageCode: string,
      recordPlaythroughProbability: number, stateClassifierMapping: any) {
    this.autoTtsEnabled = autoTtsEnabled;
    this.canEdit = canEdit;
    this.correctnessFeedbackEnabled = correctnessFeedbackEnabled;
    this.exploration = exploration;
    this.explorationId = explorationId;
    this.isLoggedIn = isLoggedIn;
    this.sessionId = sessionId;
    this.version = version;
    this.preferredAudioLanguageCode = preferredAudioLanguageCode;
    this.recordPlaythroughProbability = recordPlaythroughProbability;
    this.stateClassifierMapping = stateClassifierMapping;  
  }

  toBackendDict(): ReadOnlyExplorationDataBackendDict {
    return {
      auto_tts_enabled: this.autoTtsEnabled,
      can_edit: this.canEdit,
      correctness_feedback_enabled: this.correctnessFeedbackEnabled,
      exploration: this.exploration.toBackendDict(),
      exploration_id: this.explorationId,
      is_logged_in: this.isLoggedIn,
      session_id: this.sessionId,
      version: this.version,
      preferred_audio_language_code: this.preferredAudioLanguageCode,
      record_playthrough_probability: this.recordPlaythroughProbability,
      state_classifier_mapping: this.stateClassifierMapping
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class ReadOnlyExplorationDataObjectFactory {
  constructor(private explorationObjectFactory: ExplorationObjectFactory) {}

  createFromBackendDict(
      readOnlyExplorationBackendDict: ReadOnlyExplorationDataBackendDict): ReadOnlyExplorationData {
    return new ReadOnlyExplorationData(
      readOnlyExplorationBackendDict.auto_tts_enabled,
      readOnlyExplorationBackendDict.can_edit,
      readOnlyExplorationBackendDict.correctness_feedback_enabled,
      this.explorationObjectFactory.createFromBackendDict(
        readOnlyExplorationBackendDict.exploration),
      readOnlyExplorationBackendDict.exploration_id,
      readOnlyExplorationBackendDict.is_logged_in,
      readOnlyExplorationBackendDict.session_id,
      readOnlyExplorationBackendDict.version,
      readOnlyExplorationBackendDict.preferred_audio_language_code,
      readOnlyExplorationBackendDict.record_playthrough_probability,
      readOnlyExplorationBackendDict.state_classifier_mapping);
  }
}

angular.module('oppia').factory(
  'ReadOnlyExplorationDataObjectFactory',
  downgradeInjectable(ReadOnlyExplorationDataObjectFactory));