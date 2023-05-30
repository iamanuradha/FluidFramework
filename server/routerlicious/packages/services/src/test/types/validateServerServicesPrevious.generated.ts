/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
/*
 * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
 * Generated by fluid-type-test-generator in @fluidframework/build-tools.
 */
import * as old from "@fluidframework/server-services-previous";
import * as current from "../../index";

type TypeOnly<T> = {
    [P in keyof T]: TypeOnly<T[P]>;
};

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_ClientManager": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_ClientManager():
    TypeOnly<old.ClientManager>;
declare function use_current_ClassDeclaration_ClientManager(
    use: TypeOnly<current.ClientManager>);
use_current_ClassDeclaration_ClientManager(
    get_old_ClassDeclaration_ClientManager());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_ClientManager": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_ClientManager():
    TypeOnly<current.ClientManager>;
declare function use_old_ClassDeclaration_ClientManager(
    use: TypeOnly<old.ClientManager>);
use_old_ClassDeclaration_ClientManager(
    get_current_ClassDeclaration_ClientManager());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_DeltaManager": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_DeltaManager():
    TypeOnly<old.DeltaManager>;
declare function use_current_ClassDeclaration_DeltaManager(
    use: TypeOnly<current.DeltaManager>);
use_current_ClassDeclaration_DeltaManager(
    get_old_ClassDeclaration_DeltaManager());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_DeltaManager": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_DeltaManager():
    TypeOnly<current.DeltaManager>;
declare function use_old_ClassDeclaration_DeltaManager(
    use: TypeOnly<old.DeltaManager>);
use_old_ClassDeclaration_DeltaManager(
    get_current_ClassDeclaration_DeltaManager());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_MongoCollection": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_MongoCollection():
    TypeOnly<old.MongoCollection<any>>;
declare function use_current_ClassDeclaration_MongoCollection(
    use: TypeOnly<current.MongoCollection<any>>);
use_current_ClassDeclaration_MongoCollection(
    get_old_ClassDeclaration_MongoCollection());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_MongoCollection": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_MongoCollection():
    TypeOnly<current.MongoCollection<any>>;
declare function use_old_ClassDeclaration_MongoCollection(
    use: TypeOnly<old.MongoCollection<any>>);
use_old_ClassDeclaration_MongoCollection(
    get_current_ClassDeclaration_MongoCollection());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_MongoDb": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_MongoDb():
    TypeOnly<old.MongoDb>;
declare function use_current_ClassDeclaration_MongoDb(
    use: TypeOnly<current.MongoDb>);
use_current_ClassDeclaration_MongoDb(
    get_old_ClassDeclaration_MongoDb());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_MongoDb": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_MongoDb():
    TypeOnly<current.MongoDb>;
declare function use_old_ClassDeclaration_MongoDb(
    use: TypeOnly<old.MongoDb>);
use_old_ClassDeclaration_MongoDb(
    get_current_ClassDeclaration_MongoDb());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_MongoDbFactory": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_MongoDbFactory():
    TypeOnly<old.MongoDbFactory>;
declare function use_current_ClassDeclaration_MongoDbFactory(
    use: TypeOnly<current.MongoDbFactory>);
use_current_ClassDeclaration_MongoDbFactory(
    get_old_ClassDeclaration_MongoDbFactory());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_MongoDbFactory": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_MongoDbFactory():
    TypeOnly<current.MongoDbFactory>;
declare function use_old_ClassDeclaration_MongoDbFactory(
    use: TypeOnly<old.MongoDbFactory>);
use_old_ClassDeclaration_MongoDbFactory(
    get_current_ClassDeclaration_MongoDbFactory());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_NodeAllowList": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_NodeAllowList():
    TypeOnly<old.NodeAllowList>;
declare function use_current_ClassDeclaration_NodeAllowList(
    use: TypeOnly<current.NodeAllowList>);
use_current_ClassDeclaration_NodeAllowList(
    get_old_ClassDeclaration_NodeAllowList());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_NodeAllowList": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_NodeAllowList():
    TypeOnly<current.NodeAllowList>;
declare function use_old_ClassDeclaration_NodeAllowList(
    use: TypeOnly<old.NodeAllowList>);
use_old_ClassDeclaration_NodeAllowList(
    get_current_ClassDeclaration_NodeAllowList());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_NodeCodeLoader": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_NodeCodeLoader():
    TypeOnly<old.NodeCodeLoader>;
declare function use_current_ClassDeclaration_NodeCodeLoader(
    use: TypeOnly<current.NodeCodeLoader>);
use_current_ClassDeclaration_NodeCodeLoader(
    get_old_ClassDeclaration_NodeCodeLoader());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_NodeCodeLoader": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_NodeCodeLoader():
    TypeOnly<current.NodeCodeLoader>;
declare function use_old_ClassDeclaration_NodeCodeLoader(
    use: TypeOnly<old.NodeCodeLoader>);
use_old_ClassDeclaration_NodeCodeLoader(
    get_current_ClassDeclaration_NodeCodeLoader());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_RedisCache": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_RedisCache():
    TypeOnly<old.RedisCache>;
declare function use_current_ClassDeclaration_RedisCache(
    use: TypeOnly<current.RedisCache>);
use_current_ClassDeclaration_RedisCache(
    get_old_ClassDeclaration_RedisCache());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_RedisCache": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_RedisCache():
    TypeOnly<current.RedisCache>;
declare function use_old_ClassDeclaration_RedisCache(
    use: TypeOnly<old.RedisCache>);
use_old_ClassDeclaration_RedisCache(
    get_current_ClassDeclaration_RedisCache());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_RedisThrottleAndUsageStorageManager": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_RedisThrottleAndUsageStorageManager():
    TypeOnly<old.RedisThrottleAndUsageStorageManager>;
declare function use_current_ClassDeclaration_RedisThrottleAndUsageStorageManager(
    use: TypeOnly<current.RedisThrottleAndUsageStorageManager>);
use_current_ClassDeclaration_RedisThrottleAndUsageStorageManager(
    get_old_ClassDeclaration_RedisThrottleAndUsageStorageManager());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_RedisThrottleAndUsageStorageManager": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_RedisThrottleAndUsageStorageManager():
    TypeOnly<current.RedisThrottleAndUsageStorageManager>;
declare function use_old_ClassDeclaration_RedisThrottleAndUsageStorageManager(
    use: TypeOnly<old.RedisThrottleAndUsageStorageManager>);
use_old_ClassDeclaration_RedisThrottleAndUsageStorageManager(
    get_current_ClassDeclaration_RedisThrottleAndUsageStorageManager());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_SecretManager": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_SecretManager():
    TypeOnly<old.SecretManager>;
declare function use_current_ClassDeclaration_SecretManager(
    use: TypeOnly<current.SecretManager>);
use_current_ClassDeclaration_SecretManager(
    get_old_ClassDeclaration_SecretManager());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_SecretManager": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_SecretManager():
    TypeOnly<current.SecretManager>;
declare function use_old_ClassDeclaration_SecretManager(
    use: TypeOnly<old.SecretManager>);
use_old_ClassDeclaration_SecretManager(
    get_current_ClassDeclaration_SecretManager());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_SocketIoRedisPublisher": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_SocketIoRedisPublisher():
    TypeOnly<old.SocketIoRedisPublisher>;
declare function use_current_ClassDeclaration_SocketIoRedisPublisher(
    use: TypeOnly<current.SocketIoRedisPublisher>);
use_current_ClassDeclaration_SocketIoRedisPublisher(
    get_old_ClassDeclaration_SocketIoRedisPublisher());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_SocketIoRedisPublisher": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_SocketIoRedisPublisher():
    TypeOnly<current.SocketIoRedisPublisher>;
declare function use_old_ClassDeclaration_SocketIoRedisPublisher(
    use: TypeOnly<old.SocketIoRedisPublisher>);
use_old_ClassDeclaration_SocketIoRedisPublisher(
    get_current_ClassDeclaration_SocketIoRedisPublisher());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_SocketIoRedisTopic": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_SocketIoRedisTopic():
    TypeOnly<old.SocketIoRedisTopic>;
declare function use_current_ClassDeclaration_SocketIoRedisTopic(
    use: TypeOnly<current.SocketIoRedisTopic>);
use_current_ClassDeclaration_SocketIoRedisTopic(
    get_old_ClassDeclaration_SocketIoRedisTopic());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_SocketIoRedisTopic": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_SocketIoRedisTopic():
    TypeOnly<current.SocketIoRedisTopic>;
declare function use_old_ClassDeclaration_SocketIoRedisTopic(
    use: TypeOnly<old.SocketIoRedisTopic>);
use_old_ClassDeclaration_SocketIoRedisTopic(
    get_current_ClassDeclaration_SocketIoRedisTopic());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_Tenant": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_Tenant():
    TypeOnly<old.Tenant>;
declare function use_current_ClassDeclaration_Tenant(
    use: TypeOnly<current.Tenant>);
use_current_ClassDeclaration_Tenant(
    get_old_ClassDeclaration_Tenant());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_Tenant": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_Tenant():
    TypeOnly<current.Tenant>;
declare function use_old_ClassDeclaration_Tenant(
    use: TypeOnly<old.Tenant>);
use_old_ClassDeclaration_Tenant(
    get_current_ClassDeclaration_Tenant());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_TenantManager": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_TenantManager():
    TypeOnly<old.TenantManager>;
declare function use_current_ClassDeclaration_TenantManager(
    use: TypeOnly<current.TenantManager>);
use_current_ClassDeclaration_TenantManager(
    // @ts-expect-error compatibility expected to be broken
    get_old_ClassDeclaration_TenantManager());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_TenantManager": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_TenantManager():
    TypeOnly<current.TenantManager>;
declare function use_old_ClassDeclaration_TenantManager(
    use: TypeOnly<old.TenantManager>);
use_old_ClassDeclaration_TenantManager(
    get_current_ClassDeclaration_TenantManager());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_Throttler": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_Throttler():
    TypeOnly<old.Throttler>;
declare function use_current_ClassDeclaration_Throttler(
    use: TypeOnly<current.Throttler>);
use_current_ClassDeclaration_Throttler(
    get_old_ClassDeclaration_Throttler());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_Throttler": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_Throttler():
    TypeOnly<current.Throttler>;
declare function use_old_ClassDeclaration_Throttler(
    use: TypeOnly<old.Throttler>);
use_old_ClassDeclaration_Throttler(
    get_current_ClassDeclaration_Throttler());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_ThrottlerHelper": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_ThrottlerHelper():
    TypeOnly<old.ThrottlerHelper>;
declare function use_current_ClassDeclaration_ThrottlerHelper(
    use: TypeOnly<current.ThrottlerHelper>);
use_current_ClassDeclaration_ThrottlerHelper(
    get_old_ClassDeclaration_ThrottlerHelper());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_ThrottlerHelper": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_ThrottlerHelper():
    TypeOnly<current.ThrottlerHelper>;
declare function use_old_ClassDeclaration_ThrottlerHelper(
    use: TypeOnly<old.ThrottlerHelper>);
use_old_ClassDeclaration_ThrottlerHelper(
    get_current_ClassDeclaration_ThrottlerHelper());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "FunctionDeclaration_createMessageReceiver": {"forwardCompat": false}
*/
declare function get_old_FunctionDeclaration_createMessageReceiver():
    TypeOnly<typeof old.createMessageReceiver>;
declare function use_current_FunctionDeclaration_createMessageReceiver(
    use: TypeOnly<typeof current.createMessageReceiver>);
use_current_FunctionDeclaration_createMessageReceiver(
    get_old_FunctionDeclaration_createMessageReceiver());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "FunctionDeclaration_createMessageReceiver": {"backCompat": false}
*/
declare function get_current_FunctionDeclaration_createMessageReceiver():
    TypeOnly<typeof current.createMessageReceiver>;
declare function use_old_FunctionDeclaration_createMessageReceiver(
    use: TypeOnly<typeof old.createMessageReceiver>);
use_old_FunctionDeclaration_createMessageReceiver(
    get_current_FunctionDeclaration_createMessageReceiver());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "FunctionDeclaration_createMessageSender": {"forwardCompat": false}
*/
declare function get_old_FunctionDeclaration_createMessageSender():
    TypeOnly<typeof old.createMessageSender>;
declare function use_current_FunctionDeclaration_createMessageSender(
    use: TypeOnly<typeof current.createMessageSender>);
use_current_FunctionDeclaration_createMessageSender(
    get_old_FunctionDeclaration_createMessageSender());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "FunctionDeclaration_createMessageSender": {"backCompat": false}
*/
declare function get_current_FunctionDeclaration_createMessageSender():
    TypeOnly<typeof current.createMessageSender>;
declare function use_old_FunctionDeclaration_createMessageSender(
    use: TypeOnly<typeof old.createMessageSender>);
use_old_FunctionDeclaration_createMessageSender(
    get_current_FunctionDeclaration_createMessageSender());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "FunctionDeclaration_createMetricClient": {"forwardCompat": false}
*/
declare function get_old_FunctionDeclaration_createMetricClient():
    TypeOnly<typeof old.createMetricClient>;
declare function use_current_FunctionDeclaration_createMetricClient(
    use: TypeOnly<typeof current.createMetricClient>);
use_current_FunctionDeclaration_createMetricClient(
    get_old_FunctionDeclaration_createMetricClient());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "FunctionDeclaration_createMetricClient": {"backCompat": false}
*/
declare function get_current_FunctionDeclaration_createMetricClient():
    TypeOnly<typeof current.createMetricClient>;
declare function use_old_FunctionDeclaration_createMetricClient(
    use: TypeOnly<typeof old.createMetricClient>);
use_old_FunctionDeclaration_createMetricClient(
    get_current_FunctionDeclaration_createMetricClient());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "FunctionDeclaration_createProducer": {"forwardCompat": false}
*/
declare function get_old_FunctionDeclaration_createProducer():
    TypeOnly<typeof old.createProducer>;
declare function use_current_FunctionDeclaration_createProducer(
    use: TypeOnly<typeof current.createProducer>);
use_current_FunctionDeclaration_createProducer(
    get_old_FunctionDeclaration_createProducer());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "FunctionDeclaration_createProducer": {"backCompat": false}
*/
declare function get_current_FunctionDeclaration_createProducer():
    TypeOnly<typeof current.createProducer>;
declare function use_old_FunctionDeclaration_createProducer(
    use: TypeOnly<typeof old.createProducer>);
use_old_FunctionDeclaration_createProducer(
    get_current_FunctionDeclaration_createProducer());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "FunctionDeclaration_getDbFactory": {"forwardCompat": false}
*/
declare function get_old_FunctionDeclaration_getDbFactory():
    TypeOnly<typeof old.getDbFactory>;
declare function use_current_FunctionDeclaration_getDbFactory(
    use: TypeOnly<typeof current.getDbFactory>);
use_current_FunctionDeclaration_getDbFactory(
    get_old_FunctionDeclaration_getDbFactory());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "FunctionDeclaration_getDbFactory": {"backCompat": false}
*/
declare function get_current_FunctionDeclaration_getDbFactory():
    TypeOnly<typeof current.getDbFactory>;
declare function use_old_FunctionDeclaration_getDbFactory(
    use: TypeOnly<typeof old.getDbFactory>);
use_old_FunctionDeclaration_getDbFactory(
    get_current_FunctionDeclaration_getDbFactory());
