#!/usr/bin/env node

/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsSolutionsChecks } from "cdk-nag";
import { Aspects } from "aws-cdk-lib";
import { CodePipelineStack } from "../lib/code-pipeline-stack";

const app = new cdk.App();
const region = process.env.AWS_REGION || "us-east-1";
/** development variables **/
const enableCdkNag = false;

if (enableCdkNag) {
    Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
}

new CodePipelineStack(app, "vams-code-pipeline-stack", {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "eu-west-2" },
});

app.synth();
