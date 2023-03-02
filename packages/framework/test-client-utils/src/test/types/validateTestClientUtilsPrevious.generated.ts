/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
/*
 * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
 * Generated by fluid-type-validator in @fluidframework/build-tools.
 */
import * as old from "@fluidframework/test-client-utils-previous";
import * as current from "../../index";

type TypeOnly<T> = {
    [P in keyof T]: TypeOnly<T[P]>;
};

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_InsecureTokenProvider": {"forwardCompat": false}
*/
declare function get_old_ClassDeclaration_InsecureTokenProvider():
    TypeOnly<old.InsecureTokenProvider>;
declare function use_current_ClassDeclaration_InsecureTokenProvider(
    use: TypeOnly<current.InsecureTokenProvider>);
use_current_ClassDeclaration_InsecureTokenProvider(
    get_old_ClassDeclaration_InsecureTokenProvider());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "ClassDeclaration_InsecureTokenProvider": {"backCompat": false}
*/
declare function get_current_ClassDeclaration_InsecureTokenProvider():
    TypeOnly<current.InsecureTokenProvider>;
declare function use_old_ClassDeclaration_InsecureTokenProvider(
    use: TypeOnly<old.InsecureTokenProvider>);
use_old_ClassDeclaration_InsecureTokenProvider(
    get_current_ClassDeclaration_InsecureTokenProvider());

/*
* Validate forward compat by using old type in place of current type
* If breaking change required, add in package.json under typeValidation.broken:
* "VariableDeclaration_generateTestUser": {"forwardCompat": false}
*/
declare function get_old_VariableDeclaration_generateTestUser():
    TypeOnly<typeof old.generateTestUser>;
declare function use_current_VariableDeclaration_generateTestUser(
    use: TypeOnly<typeof current.generateTestUser>);
use_current_VariableDeclaration_generateTestUser(
    get_old_VariableDeclaration_generateTestUser());

/*
* Validate back compat by using current type in place of old type
* If breaking change required, add in package.json under typeValidation.broken:
* "VariableDeclaration_generateTestUser": {"backCompat": false}
*/
declare function get_current_VariableDeclaration_generateTestUser():
    TypeOnly<typeof current.generateTestUser>;
declare function use_old_VariableDeclaration_generateTestUser(
    use: TypeOnly<typeof old.generateTestUser>);
use_old_VariableDeclaration_generateTestUser(
    get_current_VariableDeclaration_generateTestUser());
