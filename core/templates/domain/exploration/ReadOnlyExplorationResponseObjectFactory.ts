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
 * @fileoverview Factory for creating instances of frontend
 * topic rights objects
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';
import { IExplorationBackendDict, Exploration, ExplorationObjectFactory } from
  'domain/exploration/ExplorationObjectFactory';

export interface IReadOnlyExplorationBackendDict {
  'exploration_id': string,
  'is_logged_in': boolean,
  'session_id': string,
  exploration: IExplorationBackendDict,
  version: number,
  state_classifier_mapping: any
}

export class ReadOnlyExplorationResponseData {
  explorationId: string;
  isLoggedIn: boolean;
  sessionId: string;
  exploration: Exploration;
  version: number;
  state_classifier_mapping: any;
  constructor(
      explorationId: string,
      isLoggedIn: boolean,
      sessionId: string,
      exploration: Exploration,
      version: number,
      state_classifier_mapping: any
  ) {
    this.explorationId = explorationId;
    this.isLoggedIn = isLoggedIn;
    this.sessionId = sessionId;
    this.exploration = exploration;
    this.version = version;
    this.state_classifier_mapping = state_classifier_mapping;
  }

  getExplorationId(): string {
    return this.explorationId;
  }

  getIsLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getExploration(): Exploration {
    return this.exploration;
  }

  getVersion(): number {
    return this.version;
  }

  getStateClassifierMapping(): any {
    return this.state_classifier_mapping;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ReadOnlyExplorationResponseObjectFactory {
  constructor(private explorationObjectFactory: ExplorationObjectFactory) {}

  createFromBackendDict(
      readOnlyExplorationBackendDataDict: IReadOnlyExplorationBackendDict):
    ReadOnlyExplorationResponseData {
    return new ReadOnlyExplorationResponseData (
      readOnlyExplorationBackendDataDict.exploration_id,
      readOnlyExplorationBackendDataDict.is_logged_in,
      readOnlyExplorationBackendDataDict.session_id,
      this.explorationObjectFactory.createFromBackendDict(
        readOnlyExplorationBackendDataDict.exploration),
      readOnlyExplorationBackendDataDict.version,
      readOnlyExplorationBackendDataDict.state_classifier_mapping

    );
  }
}

angular.module('oppia').factory(
  'ReadOnlyExplorationResponseObjectFactory',
  downgradeInjectable(ReadOnlyExplorationResponseObjectFactory));