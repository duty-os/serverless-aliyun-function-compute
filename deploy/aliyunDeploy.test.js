'use strict';

const sinon = require('sinon');
const BbPromise = require('bluebird');
const path = require('path');
const fs = require('fs');
const { apiGroup, apis, group, fullGroup, role, fullRole, fullApis, functions } = require('../test/data');

const AliyunProvider = require('../provider/aliyunProvider');
const AliyunDeploy = require('./aliyunDeploy');
const Serverless = require('../test/serverless');

describe('AliyunDeploy', () => {
  let serverless;
  let aliyunDeploy;
  const servicePath = path.join(__dirname, '..', 'test');

  beforeEach(() => {
    serverless = new Serverless();
    serverless.service.service = 'my-service';
    serverless.service.package = {
      artifactFilePath: '/some-remote-file-path',
      artifact: 'artifact.zip'
    };
    serverless.service.provider = {
      name: 'aliyun',
      credentials: path.join(__dirname, '..', 'test', 'credentials'),
    };
    serverless.config = {
      servicePath: path.join(__dirname, '..', 'test')
    };
  });

  describe('#constructor()', () => {
    const options = {
      stage: 'my-stage',
      region: 'my-region',
    };
    beforeEach(() => {
      serverless.setProvider('aliyun', new AliyunProvider(serverless, options));
      aliyunDeploy = new AliyunDeploy(serverless, options);
    })

    it('should set the serverless instance', () => {
      expect(aliyunDeploy.serverless).toEqual(serverless);
    });

    it('should set options if provided', () => {
      expect(aliyunDeploy.options).toEqual(options);
    });

    it('should make the provider accessible', () => {
      expect(aliyunDeploy.provider).toBeInstanceOf(AliyunProvider);
    });

    describe('hooks', () => {
      let validateStub;
      let setDefaultsStub;
      let loadTemplatesStub;
      let setupServiceStub;
      let uploadArtifactsStub;
      let setupFunctionsStub;
      let setupEventsStub;

      beforeEach(() => {
        validateStub = sinon.stub(aliyunDeploy, 'validate')
          .returns(BbPromise.resolve());
        setDefaultsStub = sinon.stub(aliyunDeploy, 'setDefaults')
          .returns(BbPromise.resolve());
        loadTemplatesStub = sinon.stub(aliyunDeploy, 'loadTemplates')
          .returns(BbPromise.resolve());
        setupServiceStub = sinon.stub(aliyunDeploy, 'setupService')
          .returns(BbPromise.resolve());
        uploadArtifactsStub = sinon.stub(aliyunDeploy, 'uploadArtifacts')
          .returns(BbPromise.resolve());
        setupFunctionsStub = sinon.stub(aliyunDeploy, 'setupFunctions')
          .returns(BbPromise.resolve());
        setupEventsStub = sinon.stub(aliyunDeploy, 'setupEvents')
          .returns(BbPromise.resolve());
      });

      afterEach(() => {
        aliyunDeploy.validate.restore();
        aliyunDeploy.setDefaults.restore();
        aliyunDeploy.loadTemplates.restore();
        aliyunDeploy.setupService.restore();
        aliyunDeploy.uploadArtifacts.restore();
        aliyunDeploy.setupFunctions.restore();
        aliyunDeploy.setupEvents.restore();
      });

      it('should run "before:deploy:deploy" promise chain', () => aliyunDeploy
        .hooks['before:deploy:deploy']().then(() => {
          expect(validateStub.calledOnce).toEqual(true);
          expect(setDefaultsStub.calledAfter(validateStub)).toEqual(true);
          expect(loadTemplatesStub.calledAfter(setDefaultsStub)).toEqual(true);
        }));

      it('should run "deploy:deploy" promise chain', () => aliyunDeploy
        .hooks['deploy:deploy']().then(() => {
          expect(setupServiceStub.calledOnce).toEqual(true);
          expect(uploadArtifactsStub.calledAfter(setupServiceStub)).toEqual(true);
          expect(setupFunctionsStub.calledAfter(uploadArtifactsStub)).toEqual(true);
          expect(setupEventsStub.calledAfter(setupFunctionsStub)).toEqual(true);
        }));
    });
  });

  describe('#deploy()', () => {
    let getServiceStub;
    let consoleLogStub;
    let createServiceStub;
    let getBucketStub;
    let createBucketStub;
    let uploadObjectStub;
    let getFunctionStub;
    let updateFunctionStub;
    let createFunctionStub;
    let getApiGroupStub;
    let createApiGroupStub;
    let getApiRoleStub;
    let createApiRoleStub;
    let getPoliciesStub;
    let createPolicyStub;
    let getApisStub;
    let updateApiStub;
    let createApiStub;
    let deployApiStub;

    beforeEach(() => {
      getServiceStub = sinon.stub(aliyunDeploy.provider, 'getService');
      consoleLogStub = sinon.stub(aliyunDeploy.serverless.cli, 'log').returns();
      createServiceStub = sinon.stub(aliyunDeploy.provider, 'createService');
      getBucketStub = sinon.stub(aliyunDeploy.provider, 'getBucket');
      createBucketStub = sinon.stub(aliyunDeploy.provider, 'createBucket');
      uploadObjectStub = sinon.stub(aliyunDeploy.provider, 'uploadObject');
      getFunctionStub = sinon.stub(aliyunDeploy.provider, 'getFunction');
      updateFunctionStub = sinon.stub(aliyunDeploy.provider, 'updateFunction');
      createFunctionStub = sinon.stub(aliyunDeploy.provider, 'createFunction');getApiGroupStub = sinon.stub(aliyunDeploy.provider, 'getApiGroup');
      createApiGroupStub = sinon.stub(aliyunDeploy.provider, 'createApiGroup');
      getApiRoleStub = sinon.stub(aliyunDeploy.provider, 'getApiRole');
      createApiRoleStub = sinon.stub(aliyunDeploy.provider, 'createApiRole');
      getPoliciesStub = sinon.stub(aliyunDeploy.provider, 'getPolicies');
      createPolicyStub = sinon.stub(aliyunDeploy.provider, 'createPolicy');
      getApisStub = sinon.stub(aliyunDeploy.provider, 'getApis');
      updateApiStub = sinon.stub(aliyunDeploy.provider, 'updateApi');
      createApiStub = sinon.stub(aliyunDeploy.provider, 'createApi');
      deployApiStub = sinon.stub(aliyunDeploy.provider, 'deployApi');
    });

    afterEach(() => {
      aliyunDeploy.provider.getService.restore();
      aliyunDeploy.serverless.cli.log.restore();
      aliyunDeploy.provider.createService.restore();
      aliyunDeploy.provider.getBucket.restore();
      aliyunDeploy.provider.createBucket.restore();
      aliyunDeploy.provider.uploadObject.restore();
      aliyunDeploy.provider.getFunction.restore();
      aliyunDeploy.provider.updateFunction.restore();
      aliyunDeploy.provider.createFunction.restore();
      aliyunDeploy.provider.getApiGroup.restore();
      aliyunDeploy.provider.createApiGroup.restore();
      aliyunDeploy.provider.getApiRole.restore();
      aliyunDeploy.provider.createApiRole.restore();
      aliyunDeploy.provider.getPolicies.restore();
      aliyunDeploy.provider.createPolicy.restore();
      aliyunDeploy.provider.getApis.restore();
      aliyunDeploy.provider.updateApi.restore();
      aliyunDeploy.provider.createApi.restore();
      aliyunDeploy.provider.deployApi.restore();
    });

    it('should set up service from scratch', () => {
      const serviceId = new Date().getTime().toString(16);
      getServiceStub.returns(BbPromise.resolve(undefined));
      createServiceStub.returns(BbPromise.resolve({ serviceId }));
      getBucketStub.returns(BbPromise.resolve(undefined));
      createBucketStub.returns(BbPromise.resolve());
      uploadObjectStub.returns(BbPromise.resolve());
      getFunctionStub.returns(BbPromise.resolve(undefined));
      updateFunctionStub.returns(BbPromise.resolve());
      createFunctionStub.returns(BbPromise.resolve());
      getApiGroupStub.returns(BbPromise.resolve(undefined));
      createApiGroupStub.returns(BbPromise.resolve(fullGroup));
      getApiRoleStub.returns(BbPromise.resolve(undefined));
      createApiRoleStub.returns(BbPromise.resolve(fullRole));
      getPoliciesStub.returns(BbPromise.resolve([]));
      createPolicyStub.returns(BbPromise.resolve(role.Policies[0]));
      getApisStub.returns(BbPromise.resolve([]));
      updateApiStub.returns(BbPromise.resolve());
      createApiStub.onCall(0).returns(BbPromise.resolve(fullApis[0]));
      createApiStub.onCall(1).returns(BbPromise.resolve(fullApis[1]));
      deployApiStub.returns(BbPromise.resolve());

      return aliyunDeploy.hooks['before:deploy:deploy']()
        .then(() => aliyunDeploy.hooks['deploy:deploy']())
        .then(() => {
          const logs = [
            'Creating service my-service-dev...',
            'Created service my-service-dev',
            'Creating bucket sls-my-service...',
            'Created bucket sls-my-service',
            'Uploading serverless/my-service/dev/1500622721413-2017-07-21T07:38:41.413Z/my-service.zip to OSS bucket sls-my-service...',
            'Uploaded serverless/my-service/dev/1500622721413-2017-07-21T07:38:41.413Z/my-service.zip to OSS bucket sls-my-service',
            'Creating function my-service-dev-postTest...',
            'Created function my-service-dev-postTest',
            'Creating function my-service-dev-getTest...',
            'Created function my-service-dev-getTest',
            'Creating API group my_service_dev_api...',
            'Created API group my_service_dev_api',
            'Creating RAM role SLSFCInvocationFromAPIGateway...',
            'Created RAM role SLSFCInvocationFromAPIGateway',
            'Attaching RAM policy AliyunFCInvocationAccess to SLSFCInvocationFromAPIGateway...',
            'Attached RAM policy AliyunFCInvocationAccess to SLSFCInvocationFromAPIGateway',
            'Creating API sls_http_my_service_dev_postTest...',
            'Created API sls_http_my_service_dev_postTest',
            'Creating API sls_http_my_service_dev_getTest...',
            'Created API sls_http_my_service_dev_getTest',
            'Deploying API sls_http_my_service_dev_postTest...',
            'Deployed API sls_http_my_service_dev_postTest',
            'POST http://523e8dc7bbe04613b5b1d726c2a7889d-cn-shanghai.alicloudapi.com/baz -> my-service-dev.my-service-dev-postTest',
            'Deploying API sls_http_my_service_dev_getTest...',
            'Deployed API sls_http_my_service_dev_getTest',
            'GET http://523e8dc7bbe04613b5b1d726c2a7889d-cn-shanghai.alicloudapi.com/quo -> my-service-dev.my-service-dev-getTest'
          ];
          for (var i = 0; i < consoleLogStub.callCount; ++i) {
            expect(consoleLogStub.getCall(i).args[0]).toEqual(logs[i]);
          }
        });
    });

    it('should handle existing service ', () => {
      const serviceId = new Date().getTime().toString(16);
      getServiceStub.returns(BbPromise.resolve({ serviceId }));
      createServiceStub.returns(BbPromise.resolve({ serviceId }));
      getBucketStub.returns(BbPromise.resolve({
        name: 'sls-my-service',
        region: 'cn-shanghai'
      }));
      createBucketStub.returns(BbPromise.resolve());
      uploadObjectStub.returns(BbPromise.resolve());
      getFunctionStub
        .withArgs('my-service-dev', 'my-service-dev-postTest')
        .returns(BbPromise.resolve(functions[0]));
      getFunctionStub
        .withArgs('my-service-dev', 'my-service-dev-getTest')
        .returns(BbPromise.resolve(functions[1]));
      updateFunctionStub.returns(BbPromise.resolve());
      createFunctionStub.returns(BbPromise.resolve());

      getApiGroupStub.returns(BbPromise.resolve(fullGroup));
      createApiGroupStub.returns(BbPromise.resolve());
      getApiRoleStub.returns(BbPromise.resolve(fullRole));
      createApiRoleStub.returns(BbPromise.resolve());
      getPoliciesStub.returns(BbPromise.resolve(role.Policies));
      createPolicyStub.returns(BbPromise.resolve());
      getApisStub.returns(BbPromise.resolve(fullApis));
      createApiStub.returns(BbPromise.resolve());
      updateApiStub.onCall(0).returns(BbPromise.resolve(fullApis[0]));
      updateApiStub.onCall(1).returns(BbPromise.resolve(fullApis[1]));
      deployApiStub.returns(BbPromise.resolve());

      const logs = [
        'Service my-service-dev already exists.',
        'Bucket sls-my-service already exists.',
        'Uploading serverless/my-service/dev/1500622721413-2017-07-21T07:38:41.413Z/my-service.zip to OSS bucket sls-my-service...',
        'Uploaded serverless/my-service/dev/1500622721413-2017-07-21T07:38:41.413Z/my-service.zip to OSS bucket sls-my-service',
        'Updating function my-service-dev-postTest...',
        'Updated function my-service-dev-postTest',
        'Updating function my-service-dev-getTest...',
        'Updated function my-service-dev-getTest',
        'API group my_service_dev_api exists.',
        'RAM role SLSFCInvocationFromAPIGateway exists.',
        'RAM policy AliyunFCInvocationAccess exists.',
        'Updating API sls_http_my_service_dev_postTest...',
        'Updated API sls_http_my_service_dev_postTest',
        'Updating API sls_http_my_service_dev_getTest...',
        'Updated API sls_http_my_service_dev_getTest',
        'Deploying API sls_http_my_service_dev_postTest...',
        'Deployed API sls_http_my_service_dev_postTest',
        'POST http://523e8dc7bbe04613b5b1d726c2a7889d-cn-shanghai.alicloudapi.com/baz -> my-service-dev.my-service-dev-postTest',
        'Deploying API sls_http_my_service_dev_getTest...',
        'Deployed API sls_http_my_service_dev_getTest',
        'GET http://523e8dc7bbe04613b5b1d726c2a7889d-cn-shanghai.alicloudapi.com/quo -> my-service-dev.my-service-dev-getTest'
      ];
      return aliyunDeploy.hooks['before:deploy:deploy']()
        .then(() => aliyunDeploy.hooks['deploy:deploy']())
        .then(() => {
          for (var i = 0; i < consoleLogStub.callCount; ++i) {
            expect(consoleLogStub.getCall(i).args[0]).toEqual(logs[i]);
          }
        });
    });
  });
});
