// Copyright 2018 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for TopicRightsBackendApiService.
 */

import { HttpClientTestingModule, HttpTestingController } from
  '@angular/common/http/testing';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { TopicRightsBackendApiService } from
  'domain/topic/topic-rights-backend-api.service';
import { TopicRights } from 'domain/topic/topic-rights.model.ts'

describe('Topic rights backend API service', () => {
  let topicRightsBackendApiService: TopicRightsBackendApiService = null;
  let httpTestingController: HttpTestingController;
  let topicId = '0';
  let topicName = '';
  let topicRightsDict = {
    can_edit_topic: false,
    can_publish_topic: true,
    published: true
  };
  let topicRightsObject = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TopicRightsBackendApiService]
    });

    topicRightsBackendApiService = TestBed.get(TopicRightsBackendApiService);
    httpTestingController = TestBed.get(HttpTestingController);

    topicRightsObject = TopicRights.createFromBackendDict(topicRightsDict);
  });

  afterEach(function() {
    httpTestingController.verify();
  });

  it('should fetch a topic rights', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    topicRightsBackendApiService.fetchTopicRights(topicId).then(
      successHandler, failHandler);
    var req = httpTestingController.expectOne(
      '/rightshandler/get_topic_rights/' + topicId);
    expect(req.request.method).toEqual('GET');
    req.flush(200);

    flushMicrotasks();

    expect(successHandler).toHaveBeenCalled();
    expect(failHandler).not.toHaveBeenCalled();
  }));

  it('should not fetch a topic rights', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    topicRightsBackendApiService.fetchTopicRights(topicId).then(
      successHandler, failHandler);
    var req = httpTestingController.expectOne(
      '/rightshandler/get_topic_rights/' + topicId);
    expect(req.request.method).toEqual('GET');
    req.flush(404, {
      status: 404, statusText: ''
    });

    flushMicrotasks();

    expect(successHandler).not.toHaveBeenCalled();
    expect(failHandler).toHaveBeenCalled();
  }));

  it('should successfully publish and unpublish a topic', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    topicRightsBackendApiService.publishTopic(topicId).then(
      successHandler, failHandler);
    var req = httpTestingController.expectOne(
      '/rightshandler/change_topic_status/0');
    expect(req.request.method).toEqual('PUT');
    req.flush(200);

    flushMicrotasks();

    expect(successHandler).toHaveBeenCalled();
    expect(failHandler).not.toHaveBeenCalled();

    topicRightsBackendApiService.unpublishTopic(topicId).then(
      successHandler, failHandler);
    var req = httpTestingController.expectOne(
      '/rightshandler/change_topic_status/0');
    expect(req.request.method).toEqual('PUT');
    req.flush(200);

    flushMicrotasks();

    expect(successHandler).toHaveBeenCalled();
    expect(failHandler).not.toHaveBeenCalled();
  }));

  it('should call the provided fail handler on HTTP failure', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    topicRightsBackendApiService.publishTopic(topicId).then(
      successHandler, failHandler);
    var req = httpTestingController.expectOne(
      '/rightshandler/change_topic_status/0');
    expect(req.request.method).toEqual('PUT');
    req.flush('Topic does not exist.', {
      status: 404, statusText: 'Topic does not exist.'
    });

    flushMicrotasks();

    expect(successHandler).not.toHaveBeenCalled();
    expect(failHandler).toHaveBeenCalled();
  }));

  it('should report an uncached topic rights after caching it',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      // The topic should not currently be cached.
      expect(topicRightsBackendApiService.isCached(topicId)).toBe(false);

      // A new topic should be fetched from the backend. Also,
      // the returned topic should match the expected topic object.
      topicRightsBackendApiService.loadTopicRights(topicId).then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne(
        '/rightshandler/get_topic_rights/0');
      expect(req.request.method).toEqual('GET');
      req.flush(topicRightsDict);

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalled();
      expect(failHandler).not.toHaveBeenCalled();
      // It should now be cached.
      expect(topicRightsBackendApiService.isCached(topicId)).toBe(true);
    }));

  it('should report a cached topic rights after caching it', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    // The topic should not currently be cached.
    expect(topicRightsBackendApiService.isCached(topicId)).toBe(false);

    // Cache a topic rights object.
    topicRightsBackendApiService.cacheTopicRights(topicId, topicRightsDict);

    flushMicrotasks();

    // It should now be cached.
    expect(topicRightsBackendApiService.isCached(topicId)).toBe(true);

    // A new topic should not have been fetched from the backend. Also,
    // the returned topic should match the expected topic object.
    topicRightsBackendApiService.loadTopicRights(topicId).then(
      successHandler, failHandler);

    flushMicrotasks();

    expect(successHandler).toHaveBeenCalledWith(topicRightsObject);
    expect(failHandler).not.toHaveBeenCalled();
  }));

  it('should send a topic rights mail', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    topicRightsBackendApiService.sendMail(topicId, topicName).then(
      successHandler, failHandler);
    var req = httpTestingController.expectOne(
      '/rightshandler/send_topic_publish_mail/' + topicId);
    expect(req.request.method).toEqual('PUT');
    req.flush(200);

    flushMicrotasks();

    expect(successHandler).toHaveBeenCalled();
    expect(failHandler).not.toHaveBeenCalled();
  }));

  it('should handler error on sending topic rights mail', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    topicRightsBackendApiService.sendMail(topicId, topicName).then(
      successHandler, failHandler);
    var req = httpTestingController.expectOne(
      '/rightshandler/send_topic_publish_mail/' + topicId);
    expect(req.request.method).toEqual('PUT');
    req.flush(404, {
      status: 404, statusText: ''
    });

    flushMicrotasks();

    expect(successHandler).not.toHaveBeenCalled();
    expect(failHandler).toHaveBeenCalled();
  }));
});
