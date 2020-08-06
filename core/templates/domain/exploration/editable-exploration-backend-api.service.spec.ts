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
 * @fileoverview Unit tests for EditableExplorationBackendApiService.
 */

import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from
  '@angular/common/http/testing';

import { EditableExplorationBackendApiService } from
  'domain/exploration/editable-exploration-backend-api.service';
import { ReadOnlyExplorationBackendApiService } from
  'domain/exploration/read-only-exploration-backend-api.service.ts';
import { EditableExplorationDataObjectFactory } from
  'domain/exploration/EditableExplorationDataObjectFactory';

fdescribe('Editable exploration backend API service', () => {
  let editableExplorationBackendApiService:
    EditableExplorationBackendApiService = null;
  let readOnlyExplorationBackendApiService:
    ReadOnlyExplorationBackendApiService = null;
  let editableExplorationDataObjectFactory:
    EditableExplorationDataObjectFactory = null;
  let httpTestingController: HttpTestingController;
  let sampleDict = {
    exploration_id: '0',
    init_state_name: 'Introduction',
    language_code: 'en',
    param_changes: [],
    param_specs: {},
    states: {
      Introduction: {
        param_changes: [],
        content: {
          html: '',
          audio_translations: {},
          content_id: null
        },
        recorded_voiceovers: {
          voiceovers_mapping: {}
        },
        written_translations: {
          translations_mapping: {}
        },
        classifier_model_id: null,
        solicit_answer_details: false,
        unresolved_answers: {},
        interaction: {
          customization_args: {},
          answer_groups: [],
          default_outcome: {
            param_changes: [],
            dest: 'Introduction',
            feedback: {
              html: '',
              audio_translations: {},
              content_id: null
            },
            labelled_as_correct: null,
            refresher_exploration_id: null,
            missing_prerequisite_skill_id: null
          },
          hints: [],
          confirmed_unclassified_answers: [],
          id: null,
          solution: null
        }
      }
    },
    username: 'test',
    user_email: 'test@example.com',
    version: 1
  };
  let sampleData = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    editableExplorationDataObjectFactory = TestBed.get(
      EditableExplorationDataObjectFactory);
    readOnlyExplorationBackendApiService = TestBed.get(
      ReadOnlyExplorationBackendApiService);
    editableExplorationBackendApiService = TestBed.get(
      EditableExplorationBackendApiService);
    httpTestingController = TestBed.get(HttpTestingController);

    sampleData = editableExplorationDataObjectFactory.createFromBackendDict(
      sampleDict);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should successfully fetch an existing exploration from the backend',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      editableExplorationBackendApiService.fetchExploration('0').then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne('/createhandler/data/0');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleDict);

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith(sampleData);
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should fetch and apply the draft of an exploration',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      // Loading a exploration the first time should fetch it from the backend.
      editableExplorationBackendApiService.fetchApplyDraftExploration('0').then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne(
        '/createhandler/data/0?apply_draft=true');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleDict);

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith(sampleData);
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should use the rejection handler if the backend request failed',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      // Loading a exploration the first time should fetch it from the backend.
      editableExplorationBackendApiService.fetchExploration('1').then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne('/createhandler/data/1');
      expect(req.request.method).toEqual('GET');
      req.flush('Error loading exploration 1.', {
        status: 500, statusText: 'Error loading exploration 1.'
      });

      flushMicrotasks();

      expect(successHandler).not.toHaveBeenCalled();
      expect(failHandler).toHaveBeenCalledWith('Error loading exploration 1.');
    }));

  it('should update an exploration after fetching it from the backend',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');
      let exploration = null;

      // Loading a exploration the first time should fetch it from the backend.
      editableExplorationBackendApiService.fetchExploration('0').then(data => {
        exploration = data;
      });

      var req = httpTestingController.expectOne('/createhandler/data/0');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleDict);
      flushMicrotasks();

      exploration.title = 'New Title';
      exploration.version = '2';

      // Send a request to update exploration
      editableExplorationBackendApiService.updateExploration(
        exploration.exploration_id, exploration.version,
        exploration.title, []).then(successHandler, failHandler);

      flushMicrotasks();

      req = httpTestingController.expectOne('/createhandler/data/0');
      expect(req.request.method).toEqual('PUT');
      req.flush(exploration);
      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith(exploration);
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should not cache exploration from backend into read only service',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');
      var exploration = null;

      readOnlyExplorationBackendApiService.loadLatestExploration('0', null)
        .then(data => {
          exploration = data;

          var req = httpTestingController.expectOne('/explorehandler/init/0');
          expect(req.request.method).toEqual('GET');
          req.flush(sampleDict);

          flushMicrotasks();

          expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(true);

          exploration.title = 'New Title';
          exploration.version = '2';

          // Send a request to update exploration
          editableExplorationBackendApiService.updateExploration(
            exploration.exploration_id, exploration.version,
            exploration.title, []).then(successHandler, failHandler);
          req = httpTestingController.expectOne('/createhandler/data/0');
          expect(req.request.method).toEqual('PUT');
          req.flush(exploration);

          flushMicrotasks();

          expect(successHandler).toHaveBeenCalledWith(exploration);
          expect(failHandler).not.toHaveBeenCalled();

          expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(false);
      });
    }));

  it('should delete exploration from the backend',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');
      var exploration = null;

      editableExplorationBackendApiService.fetchExploration('0').then(data => {
        exploration = data;

        var req = httpTestingController.expectOne('/createhandler/data/0');
        expect(req.request.method).toEqual('GET');
        req.flush(sampleDict);

        flushMicrotasks();

        exploration.title = 'New Title';
        exploration.version = '2';

        // Send a request to update exploration
        editableExplorationBackendApiService.updateExploration(
          exploration.exploration_id, exploration.version,
          'Minor edits', []).then(successHandler, failHandler);
        req = httpTestingController.expectOne('/createhandler/data/0');
        expect(req.request.method).toEqual('PUT');
        req.flush(exploration);

        flushMicrotasks();

        expect(successHandler).toHaveBeenCalledWith(exploration);
        expect(failHandler).not.toHaveBeenCalled();

        editableExplorationBackendApiService
          .deleteExploration(exploration.exploration_id)
          .then(successHandler, failHandler);
        req = httpTestingController.expectOne('/createhandler/data/0');
        expect(req.request.method).toEqual('DELETE');
        req.flush({});

        flushMicrotasks();

        expect(successHandler).toHaveBeenCalledWith({});
        expect(failHandler).not.toHaveBeenCalled();

        expect(readOnlyExplorationBackendApiService.isCached('0')).toBe(false);
      });
    }));
});
