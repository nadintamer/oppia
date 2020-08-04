// Copyright 2016 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Service to retrieve read only information
 * about explorations from the backend.
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import cloneDeep from 'lodash/cloneDeep';

import { AppConstants } from
  'app.constants';
import { Exploration, ExplorationObjectFactory, IExplorationBackendDict } from
  'domain/exploration/ExplorationObjectFactory';
import { IBackendStateClassifierMapping } from
  'pages/exploration-player-page/services/state-classifier-mapping.service.ts';
import { UrlInterpolationService } from
  'domain/utilities/url-interpolation.service';

interface ReadOnlyExplorationDataBackendDict {
  'can_edit': boolean;
  'exploration': IExplorationBackendDict;
  'exploration_id': string;
  'is_logged_in': boolean;
  'session_id': string;
  'version': number;
  'preferred_audio_language_code': string;
  'state_classifier_mapping': IBackendStateClassifierMapping,
  'auto_tts_enabled': boolean;
  'correctness_feedback_enabled': boolean;
  'record_playthrough_probability': number;
}

interface ReadOnlyExplorationData {
  canEdit: boolean;
  exploration: Exploration;
  explorationId: string;
  isLoggedIn: boolean;
  sessionId: string;
  version: number;
  preferredAudioLanguageCode: string;
  stateClassifierMapping: IBackendStateClassifierMapping;
  autoTtsEnabled: boolean;
  correctnessFeedbackEnabled: boolean;
  recordPlaythroughProbability: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReadOnlyExplorationBackendApiService {
  constructor(
    private explorationObjectFactory: ExplorationObjectFactory,
    private http: HttpClient,
    private urlInterpolation: UrlInterpolationService) {}

  // Maps previously loaded explorations to their IDs.
  private _explorationCache = [];

  private _fetchExploration(
      explorationId: string,
      version: number,
      successCallback: (value?: Object | PromiseLike<Object>) => void,
      errorCallback: (reason?: string) => void): void {
    var explorationDataUrl = this._getExplorationUrl(explorationId, version);

    this.http.get<ReadOnlyExplorationDataBackendDict>(
      explorationDataUrl).toPromise().then(response => {
      var readOnlyExplorationData = {
        canEdit: response.can_edit,
        exploration: this.explorationObjectFactory.createFromBackendDict(
          response.exploration),
        explorationId: response.exploration_id,
        isLoggedIn: response.is_logged_in,
        sessionId: response.session_id,
        version: response.version,
        preferredAudioLanguageCode: response.preferred_audio_language_code,
        stateClassifierMapping: response.state_classifier_mapping,
        autoTtsEnabled: response.auto_tts_enabled,
        correctnessFeedbackEnabled: response.correctness_feedback_enabled,
        recordPlaythroughProbability: response.record_playthrough_probability
      };

      if (successCallback) {
        successCallback(readOnlyExplorationData);
      }
    }, errorResponse => {
      if (errorCallback) {
        errorCallback(errorResponse.error);
      }
    });
  }

  private _isCached(explorationId: string) : boolean {
    return this._explorationCache.hasOwnProperty(explorationId);
  }

  private _getExplorationUrl(explorationId: string, version: number) : string {
    if (version) {
      return this.urlInterpolation.interpolateUrl(
        AppConstants.EXPLORATION_VERSION_DATA_URL_TEMPLATE, {
          exploration_id: explorationId,
          version: String(version)
        });
    }
    return this.urlInterpolation.interpolateUrl(
      AppConstants.EXPLORATION_DATA_URL_TEMPLATE, {
        exploration_id: explorationId
      }
    );
  }

  /**
    * Retrieves an exploration from the backend given an exploration ID
    * and version number (or none). This returns a promise object that
    * allows success and rejection callbacks to be registered. If the
    * exploration is successfully loaded and a success callback function
    * is provided to the promise object, the success callback is called
    * with the exploration passed in as a parameter. If something goes
    * wrong while trying to fetch the exploration, the rejection callback
    * is called instead, if present. The rejection callback function is
    * passed any data returned by the backend in the case of an error.
    */
  fetchExploration(explorationId: string, version: number) :
      Promise<ReadOnlyExplorationData> {
    return new Promise((resolve, reject) => {
      this._fetchExploration(explorationId, version, resolve, reject);
    });
  }

  /**
    * Behaves in the exact same way as fetchExploration (including
    * callback behavior and returning a promise object),
    * except this function will attempt to see whether the latest version
    * of the given exploration has already been loaded. If it has not yet
    * been loaded, it will fetch the exploration from the backend. If it
    * successfully retrieves the exploration from the backend, this method
    * will store the exploration in the cache to avoid requests from the
    * backend in further function calls.
    */
  loadLatestExploration(explorationId: string) :
      Promise<ReadOnlyExplorationData> {
    return new Promise((resolve, reject) => {
      if (this._isCached(explorationId)) {
        if (resolve) {
          resolve(cloneDeep(this._explorationCache[explorationId]));
        }
      } else {
        this._fetchExploration(explorationId, null, (exploration) => {
          // Save the fetched exploration to avoid future fetches.
          this._explorationCache[explorationId] = exploration;
          if (resolve) {
            resolve(cloneDeep(exploration));
          }
        }, reject);
      }
    });
  }

  /**
    * Retrieves an exploration from the backend given an exploration ID
    * and version number. This method does not interact with any cache
    * and using this method will not overwrite or touch the state of the
    * cache. All previous data in the cache will still be retained after
    * this call.
    */
  loadExploration(explorationId: string, version: number) :
      Promise<ReadOnlyExplorationData> {
    return new Promise((resolve, reject) => {
      this._fetchExploration(explorationId, version, (exploration) => {
        if (resolve) {
          resolve(cloneDeep(exploration));
        }
      }, reject);
    });
  }

  /**
    * Returns whether the given exploration is stored within the local
    * data cache or if it needs to be retrieved from the backend upon a
    * load.
    */
  isCached(explorationId: string) : boolean {
    return this._isCached(explorationId);
  }

  /**
    * Replaces the current exploration in the cache given by the specified
    * exploration ID with a new exploration object.
    */
  cacheExploration(explorationId: string, exploration: any) {
    this._explorationCache[explorationId] = cloneDeep(exploration);
  }

  /**
    * Clears the local exploration data cache, forcing all future loads to
    * re-request the previously loaded explorations from the backend.
    */
  clearExplorationCache() {
    this._explorationCache = [];
  }

  /**
    * Deletes a specific exploration from the local cache
    */
  deleteExplorationFromCache(explorationId: string) {
    if (this._isCached(explorationId)) {
      delete this._explorationCache[explorationId];
    }
  }
}

angular.module('oppia').factory(
  'ReadOnlyExplorationBackendApiService',
  downgradeInjectable(ReadOnlyExplorationBackendApiService));
