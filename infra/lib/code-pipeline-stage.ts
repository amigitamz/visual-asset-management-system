import { VAMS } from "./infra-stack";
import { CfWafStack } from "./cf-waf-stack";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

/**
 * Deployable unit of web service app
 */
export class CodePipelineStage extends cdk.Stage {
    public readonly urlOutput: cdk.CfnOutput;

    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
        super(scope, id, props);

        const region = props?.env?.region || this.node.tryGetContext("region") || "us-east-1";
        const stackName =
            (process.env.STACK_NAME || this.node.tryGetContext("stack-name")) + "-" + region;
        const dockerDefaultPlatform = process.env.DOCKER_DEFAULT_PLATFORM;
        const stagingBucket =
            process.env.STAGING_BUCKET || this.node.tryGetContext("staging-bucket");

        console.log("STACK_NAME 👉", stackName);
        console.log("REGION 👉", region);
        console.log("DOCKER_DEFAULT_PLATFORM 👉", dockerDefaultPlatform);

        if (stagingBucket) {
            console.log("STAGING_BUCKET 👉", stagingBucket);
        }

        //The web access firewall currently needs to be in us-east-1
        const cfWafStack = new CfWafStack(
            this,
            `vams-waf-${stackName || process.env.DEMO_LABEL || "dev"}`,
            {
                stackName: `vams-waf-${stackName || process.env.DEPLOYMENT_ENV || "dev"}`,
                env: {
                    account: process.env.CDK_DEFAULT_ACCOUNT,
                    region: "us-east-1",
                },
            }
        );

        const vamsStack = new VAMS(this, `vams-${stackName || process.env.DEMO_LABEL || "dev"}`, {
            prod: false,
            stackName: `vams-${stackName || process.env.DEPLOYMENT_ENV || "dev"}`,
            env: {
                account: process.env.CDK_DEFAULT_ACCOUNT,
                region: region,
            },
            ssmWafArnParameterName: cfWafStack.ssmWafArnParameterName,
            ssmWafArnParameterRegion: cfWafStack.region,
            ssmWafArn: cfWafStack.wafArn,
            stagingBucket: stagingBucket,
        });

        vamsStack.addDependency(cfWafStack);
    }
}
