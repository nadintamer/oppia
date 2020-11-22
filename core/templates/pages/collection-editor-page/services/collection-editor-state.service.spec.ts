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
 * @fileoverview Unit tests for CollectionEditorStateService.
 */

import { TestBed } from '@angular/core/testing';

import { Subscription } from 'rxjs';

import { Collection } from 'domain/collection/collection.model';
import { CollectionRightsBackendApiService } from 'domain/collection/collection-rights-backend-api.service.ts'
import { CollectionRights } from 'domain/collection/collection-rights.model';
import { CollectionUpdateService } from 'domain/collection/collection-update.service.ts';
import { CollectionEditorStateService } from 'pages/collection-editor-page/services/collection-editor-state.service.ts';
import { EditableCollectionBackendApiService } from 'domain/collection/editable-collection-backend-api.service.ts';
import { importAllAngularServices } from 'tests/unit-test-utils';

// TODO(bhenning): Consider moving this to a more shareable location.
class MockEditableCollectionBackendApiService {
  newBackendCollectionObject = null;
  failure = null;

  _fetchOrUpdateCollection() {
    return new Promise((resolve, reject) => {
      if (!this.failure) {
        resolve(Collection.create(
          this.newBackendCollectionObject));
      } else {
        reject();
      }
    });
  }

  fetchCollection() {
    return this._fetchOrUpdateCollection();
  }

  updateCollection() {
    return this._fetchOrUpdateCollection();
  }
}

class MockCollectionRightsBackendApiService {
  backendCollectionRightsObject = null;
  failure = null;

  _fetchCollectionRights() {
    return new Promise((resolve, reject) => {
      if (!this.failure) {
        resolve(
          CollectionRights.create(
            this.backendCollectionRightsObject
          ));
      } else {
        reject();
      }
    });
  }

  fetchCollectionRights() {
    return this._fetchCollectionRights();
  }
}

fdescribe('Collection editor state service', () => {
  let collectionEditorStateService: CollectionEditorStateService = null;
  let collectionUpdateService: CollectionUpdateService = null;
  let mockEditableCollectionBackendApiService = null;
  let mockCollectionRightsBackendApiService = null;
  let secondBackendCollectionObject = null;
  let unpublishablePublicCollectionRightsObject = null;
  let testSubscriptions: Subscription;

  const collectionInitializedSpy = jasmine.createSpy('collectionInitialized');

  beforeEach(angular.mock.module('oppia'));
  // importAllAngularServices();

  beforeEach(() => {
    mockEditableCollectionBackendApiService = new MockEditableCollectionBackendApiService();
    mockCollectionRightsBackendApiService = new MockCollectionRightsBackendApiService();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: EditableCollectionBackendApiService,
          useValue: mockEditableCollectionBackendApiService
        },
        {
          provide: CollectionRightsBackendApiService,
          useValue: mockCollectionRightsBackendApiService
        }
      ]
    }).compileComponents();

    collectionEditorStateService = TestBed.get(CollectionEditorStateService);
    collectionUpdateService = TestBed.get(CollectionUpdateService);

    mockEditableCollectionBackendApiService.newBackendCollectionObject = {
      id: '0',
      title: 'Collection Under Test',
      category: 'Test',
      objective: 'To pass',
      language_code: 'en',
      schema_version: '3',
      version: '1',
      nodes: [{
        exploration_id: '0'
      }, {
        exploration_id: '1'
      }],
      playthrough_dict: {
        next_exploration_id: 'expId',
        completed_exploration_ids: ['expId2']
      }
    };
    secondBackendCollectionObject = {
      id: '5',
      title: 'Interesting collection',
      category: 'Test',
      objective: 'To be interesting',
      language_code: 'en',
      tags: [],
      schema_version: '3',
      version: '3',
      nodes: [{
        exploration_id: '0'
      }],
      playthrough_dict: {
        next_exploration_id: 'expId',
        completed_exploration_ids: ['expId2']
      }
    };

    var privateCollectionRightsObject = {
      collection_id: '5',
      can_edit: 'true',
      can_unpublish: 'false',
      is_private: 'true',
      owner_names: ['A']
    };
    mockCollectionRightsBackendApiService.backendCollectionRightsObject = (
      privateCollectionRightsObject);

    unpublishablePublicCollectionRightsObject = {
      collection_id: '5',
      can_edit: 'true',
      can_unpublish: 'true',
      is_private: 'false',
      owner_names: ['A']
    };

    testSubscriptions = new Subscription();
    testSubscriptions.add(
      collectionEditorStateService.onCollectionInitialized().subscribe(
        collectionInitializedSpy));
  });

  afterEach(() => {
    testSubscriptions.unsubscribe();
  });

  it('should request to load the collection from the backend', () => {
    spyOn(
      mockEditableCollectionBackendApiService,
      'fetchCollection').and.callThrough();

    collectionEditorStateService.loadCollection(5);
    expect(mockEditableCollectionBackendApiService.fetchCollection)
      .toHaveBeenCalled();
  });

  it('should request to load the collection rights from the backend',
    () => {
      spyOn(mockCollectionRightsBackendApiService, 'fetchCollectionRights')
        .and.callThrough();

      collectionEditorStateService.loadCollection(5);
      expect(mockCollectionRightsBackendApiService.fetchCollectionRights)
        .toHaveBeenCalled();
    }
  );

  it('should fire an init event after loading the first collection',
    () => {
      collectionEditorStateService.loadCollection(5);
      // $rootScope.$apply();

      expect(collectionInitializedSpy).toHaveBeenCalled();
    }
  );

  it('should fire an update event after loading more collections', () => {
    // Load initial collection.
    collectionEditorStateService.loadCollection(5);
    // $rootScope.$apply();

    // Load a second collection.
    collectionEditorStateService.loadCollection(1);
    // $rootScope.$apply();

    expect(collectionInitializedSpy).toHaveBeenCalled();
  });

  it('should track whether it is currently loading the collection', () => {
    expect(collectionEditorStateService.isLoadingCollection()).toBe(false);

    collectionEditorStateService.loadCollection(5);
    expect(collectionEditorStateService.isLoadingCollection()).toBe(true);

    // $rootScope.$apply();
    expect(collectionEditorStateService.isLoadingCollection()).toBe(false);
  });

  it('should indicate a collection is no longer loading after an error',
    () => {
      expect(collectionEditorStateService.isLoadingCollection()).toBe(false);
      mockEditableCollectionBackendApiService.failure = 'Internal 500 error';

      collectionEditorStateService.loadCollection(5);
      expect(collectionEditorStateService.isLoadingCollection()).toBe(true);

      // $rootScope.$apply();
      expect(collectionEditorStateService.isLoadingCollection()).toBe(false);
    }
  );

  it('should report that a collection has loaded through loadCollection()',
    () => {
      expect(collectionEditorStateService.hasLoadedCollection()).toBe(false);

      collectionEditorStateService.loadCollection(5);
      expect(collectionEditorStateService.hasLoadedCollection()).toBe(false);

      // $rootScope.$apply();
      expect(collectionEditorStateService.hasLoadedCollection()).toBe(true);
    }
  );

  it('should report that a collection has loaded through setCollection()',
    () => {
      expect(collectionEditorStateService.hasLoadedCollection()).toBe(false);

      var newCollection = Collection.create(
        secondBackendCollectionObject);
      collectionEditorStateService.setCollection(newCollection);
      expect(collectionEditorStateService.hasLoadedCollection()).toBe(true);
    }
  );

  it('should initially return an empty collection', () => {
    var collection = collectionEditorStateService.getCollection();
    expect(collection.getId()).toBeNull();
    expect(collection.getTitle()).toBeNull();
    expect(collection.getObjective()).toBeNull();
    expect(collection.getCategory()).toBeNull();
    expect(collection.getCollectionNodes()).toEqual([]);
  });

  it('should initially return an empty collection rights', () => {
    var collectionRights = collectionEditorStateService.getCollectionRights();
    expect(collectionRights.getCollectionId()).toBeNull();
    expect(collectionRights.canEdit()).toBeNull();
    expect(collectionRights.canUnpublish()).toBeNull();
    expect(collectionRights.isPrivate()).toBeNull();
    expect(collectionRights.getOwnerNames()).toEqual([]);
  });

  it('should return the last collection loaded as the same object', () => {
    var previousCollection = collectionEditorStateService.getCollection();
    var expectedCollection = Collection.create(
      mockEditableCollectionBackendApiService.newBackendCollectionObject);
    expect(previousCollection).not.toEqual(expectedCollection);

    collectionEditorStateService.loadCollection(5);
    // $rootScope.$apply();

    var actualCollection = collectionEditorStateService.getCollection();
    expect(actualCollection).toEqual(expectedCollection);

    // Although the actual collection equals the expected collection, they are
    // different objects. Ensure that the actual collection is still the same
    // object from before loading it, however.
    expect(actualCollection).toBe(previousCollection);
    expect(actualCollection).not.toBe(expectedCollection);
  });

  it('should return the last collection rights loaded as the same object',
    () => {
      var previousCollectionRights = (
        collectionEditorStateService.getCollectionRights());
      var expectedCollectionRights = CollectionRights.create(
        mockCollectionRightsBackendApiService.backendCollectionRightsObject);
      expect(previousCollectionRights).not.toEqual(expectedCollectionRights);

      collectionEditorStateService.loadCollection(5);
      // $rootScope.$apply();

      var actualCollectionRights = (
        collectionEditorStateService.getCollectionRights());
      expect(actualCollectionRights).toEqual(expectedCollectionRights);

      // Although the actual collection rights equals the expected collection
      // rights, they are different objects. Ensure that the actual collection
      // rights is still the same object from before loading it, however.
      expect(actualCollectionRights).toBe(previousCollectionRights);
      expect(actualCollectionRights).not.toBe(expectedCollectionRights);
    }
  );

  it('should be able to set a new collection with an in-place copy',
    () => {
      var previousCollection = collectionEditorStateService.getCollection();
      var expectedCollection = Collection.create(
        secondBackendCollectionObject);
      expect(previousCollection).not.toEqual(expectedCollection);

      collectionEditorStateService.setCollection(expectedCollection);

      var actualCollection = collectionEditorStateService.getCollection();
      expect(actualCollection).toEqual(expectedCollection);

      // Although the actual collection equals the expected collection, they are
      // different objects. Ensure that the actual collection is still the same
      // object from before loading it, however.
      expect(actualCollection).toBe(previousCollection);
      expect(actualCollection).not.toBe(expectedCollection);
    }
  );

  it('should be able to set a new collection rights with an in-place copy',
    () => {
      var previousCollectionRights = (
        collectionEditorStateService.getCollectionRights());
      var expectedCollectionRights = CollectionRights.create(
        unpublishablePublicCollectionRightsObject);
      expect(previousCollectionRights).not.toEqual(expectedCollectionRights);

      collectionEditorStateService.setCollectionRights(
        expectedCollectionRights);

      var actualCollectionRights = (
        collectionEditorStateService.getCollectionRights());
      expect(actualCollectionRights).toEqual(expectedCollectionRights);

      // Although the actual collection rights equals the expected collection
      // rights, they are different objects. Ensure that the actual collection
      // rights is still the same object from before loading it, however.
      expect(actualCollectionRights).toBe(previousCollectionRights);
      expect(actualCollectionRights).not.toBe(expectedCollectionRights);
    }
  );

  it('should fire an update event after setting the new collection',
    () => {
      // Load initial collection.
      collectionEditorStateService.loadCollection(5);
      // $rootScope.$apply();

      var newCollection = Collection.create(
        secondBackendCollectionObject);
      collectionEditorStateService.setCollection(newCollection);

      expect(collectionInitializedSpy).toHaveBeenCalled();
    }
  );

  it('should fail to save the collection without first loading one',
    () => {
      expect(function() {
        collectionEditorStateService.saveCollection('Commit message');
      }).toThrowError('Cannot save a collection before one is loaded.');
    }
  );

  it('should not save the collection if there are no pending changes',
    () => {
      collectionEditorStateService.loadCollection(5);
      // $rootScope.$apply();

      expect(collectionEditorStateService.saveCollection(
        'Commit message'), {}).toBe(false);
    }
  );

  it('should be able to save the collection and pending changes', () => {
    spyOn(
      mockEditableCollectionBackendApiService,
      'updateCollection').and.callThrough();

    collectionEditorStateService.loadCollection(0);
    collectionUpdateService.setCollectionTitle(
      collectionEditorStateService.getCollection(), 'New title');
    // $rootScope.$apply();

    expect(collectionEditorStateService.saveCollection(
      'Commit message')).toBe(true);
    // $rootScope.$apply();

    var expectedId = '0';
    var expectedVersion = '1';
    var expectedCommitMessage = 'Commit message';
    var updateCollectionSpy = (
      mockEditableCollectionBackendApiService.updateCollection);
    expect(updateCollectionSpy).toHaveBeenCalledWith(
      expectedId, expectedVersion, expectedCommitMessage, jasmine.any(Object));
  });

  it('should fire an update event after saving the collection', () => {
    collectionEditorStateService.loadCollection(5);
    collectionUpdateService.setCollectionTitle(
      collectionEditorStateService.getCollection(), 'New title');
    // $rootScope.$apply();

    collectionEditorStateService.saveCollection('Commit message');
    // $rootScope.$apply();

    expect(collectionInitializedSpy).toHaveBeenCalled();
  });

  it('should track whether it is currently saving the collection', () => {
    collectionEditorStateService.loadCollection(5);
    collectionUpdateService.setCollectionTitle(
      collectionEditorStateService.getCollection(), 'New title');
    // $rootScope.$apply();

    expect(collectionEditorStateService.isSavingCollection()).toBe(false);
    collectionEditorStateService.saveCollection('Commit message');
    expect(collectionEditorStateService.isSavingCollection()).toBe(true);

    // $rootScope.$apply();
    expect(collectionEditorStateService.isSavingCollection()).toBe(false);
  });

  it('should indicate a collection is no longer saving after an error',
    () => {
      collectionEditorStateService.loadCollection(5);
      collectionUpdateService.setCollectionTitle(
        collectionEditorStateService.getCollection(), 'New title');
      // $rootScope.$apply();

      expect(collectionEditorStateService.isSavingCollection()).toBe(false);
      mockEditableCollectionBackendApiService.failure = 'Internal 500 error';

      collectionEditorStateService.saveCollection('Commit message');
      expect(collectionEditorStateService.isSavingCollection()).toBe(true);

      // $rootScope.$apply();
      expect(collectionEditorStateService.isSavingCollection()).toBe(false);
    }
  );
});
