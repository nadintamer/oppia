// Copyright 2015 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for ReadOnlyExplorationBackendApiService.
 */

import { HttpClientTestingModule, HttpTestingController } from
  '@angular/common/http/testing';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { CamelCaseToHyphensPipe } from
  'filters/string-utility-filters/camel-case-to-hyphens.pipe';
import { ExplorationObjectFactory} from
  'domain/exploration/ExplorationObjectFactory';
import { ReadOnlyExplorationDataObjectFactory, ReadOnlyExplorationDataBackendDict } from
  'domain/exploration/ReadOnlyExplorationDataObjectFactory';
import { ReadOnlyExplorationBackendApiService } from
  'domain/exploration/read-only-exploration-backend-api.service.ts';
import { SubtitledHtmlObjectFactory } from
  'domain/exploration/SubtitledHtmlObjectFactory';

describe('Read only exploration backend API service', () => {
  let readOnlyExplorationBackendApiService:
    ReadOnlyExplorationBackendApiService = null;
  let explorationObjectFactory: ExplorationObjectFactory = null;
  let subtitledHtmlObjectFactory: SubtitledHtmlObjectFactory = null;
  let readOnlyExplorationDataObjectFactory:
    ReadOnlyExplorationDataObjectFactory = null;
  let httpTestingController: HttpTestingController;

  let explorationDict = {
    id: 1,
    title: 'My Title',
    category: 'Art',
    objective: 'Your objective',
    tags: [],
    blurb: '',
    author_notes: '',
    states_schema_version: 15,
    init_state_name: 'Introduction',
    language_code: 'en',
    states: {},
    param_specs: {},
    param_changes: [],
    version: 1
  };
  let sampleDict = {
    exploration_id: '0',
    is_logged_in: true,
    session_id: 'KERH',
    correctness_feedback_enabled: false,
    can_edit: false,
    preferred_audio_language_code: '',
    auto_tts_enabled: false,
    record_playthrough_probability: 0,
    exploration: explorationDict,
    version: 1,
    state_classifier_mapping: {}
  };
  let sampleData = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CamelCaseToHyphensPipe],
      imports: [HttpClientTestingModule]
    });

    subtitledHtmlObjectFactory = TestBed.get(
      SubtitledHtmlObjectFactory);
    readOnlyExplorationBackendApiService = TestBed.get(
      ReadOnlyExplorationBackendApiService);
    httpTestingController = TestBed.get(HttpTestingController);
    explorationObjectFactory = TestBed.get(ExplorationObjectFactory);
    readOnlyExplorationDataObjectFactory = TestBed.get(
      ReadOnlyExplorationDataObjectFactory);

    sampleData = readOnlyExplorationDataObjectFactory.createFromBackendDict(
      sampleDict);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should successfully fetch an existing exploration from the backend',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      readOnlyExplorationBackendApiService.fetchExploration('0', null).then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne('/explorehandler/init/0');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleDict);

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith(sampleData);
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should successfully fetch an existing exploration with version from' +
    ' the backend', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    readOnlyExplorationBackendApiService.fetchExploration(
      '0', 1).then(successHandler, failHandler);
    var req = httpTestingController.expectOne('/explorehandler/init/0?v=1');
    expect(req.request.method).toEqual('GET');
    req.flush(sampleDict);

    flushMicrotasks();

    expect(successHandler).toHaveBeenCalledWith(sampleData);
    expect(failHandler).not.toHaveBeenCalled();
  }));

  it('should load a cached exploration after fetching it from the backend',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      // Loading a exploration the first time should fetch it from the backend.
      // readOnlyExplorationBackendApiService.loadExploration('0', null).then(
      //  successHandler, failHandler);
      readOnlyExplorationBackendApiService.loadLatestExploration('0').then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne('/explorehandler/init/0');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleDict);

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith(sampleData);
      expect(failHandler).not.toHaveBeenCalled();

      // Loading a exploration the second time should not fetch it.
      // readOnlyExplorationBackendApiService.loadExploration('0', null).then(
      //  successHandler, failHandler);
      readOnlyExplorationBackendApiService.loadLatestExploration('0').then(
        successHandler, failHandler);

      expect(successHandler).toHaveBeenCalledWith(sampleData);
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should use the rejection handler if the backend request failed',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      // Loading a exploration the first time should fetch it from the backend.
      readOnlyExplorationBackendApiService.loadExploration('0', null).then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne('/explorehandler/init/0');
      expect(req.request.method).toEqual('GET');
      req.flush('Error loading exploration 0.', {
        status: 500, statusText: 'Invalid Request'
      });

      flushMicrotasks();

      expect(successHandler).not.toHaveBeenCalled();
      expect(failHandler).toHaveBeenCalledWith('Error loading exploration 0.');
    }));

  it('should report caching and support clearing the cache',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      // The exploration should not currently be cached.
      expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(false);

      // Loading a exploration the first time should fetch it from the backend.
      readOnlyExplorationBackendApiService.loadLatestExploration('0').then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne('/explorehandler/init/0');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleDict);

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith(sampleData);
      expect(failHandler).not.toHaveBeenCalled();

      // The exploration should now be cached.
      expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(true);

      // The exploration should be loadable from the cache.
      readOnlyExplorationBackendApiService.loadLatestExploration('0').then(
        successHandler, failHandler);
      expect(successHandler).toHaveBeenCalledWith(sampleData);
      expect(failHandler).not.toHaveBeenCalled();

      // Resetting the cache will cause another fetch from the backend.
      readOnlyExplorationBackendApiService.clearExplorationCache();
      expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(false);

      readOnlyExplorationBackendApiService.loadLatestExploration('0').then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne('/explorehandler/init/0');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleDict);

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith(sampleData);
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should report a cached exploration after caching it',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      // The exploration should not currently be cached.
      expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(false);

      // Cache a exploration.
      readOnlyExplorationBackendApiService.cacheExploration('0', {
        id: '0',
        nodes: []
      });

      // It should now be cached.
      expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(true);

      // A new exploration should not have been fetched from the backend. Also,
      // the returned exploration should match the expected exploration object.
      readOnlyExplorationBackendApiService.loadLatestExploration('0').then(
        successHandler, failHandler);

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith({
        id: '0',
        nodes: []
      });
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should delete a exploration from cache',
    fakeAsync(() => {
      expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(false);

      readOnlyExplorationBackendApiService.cacheExploration('0', {
        id: '0',
        nodes: []
      });

      expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(true);

      readOnlyExplorationBackendApiService.deleteExplorationFromCache('0');
      expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(false);
    }));
});
