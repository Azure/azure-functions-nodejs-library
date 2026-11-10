// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { ConnectorCardinality, ConnectorDeliveryMode, CosmosDBv4ChangeFeedMode } from '../../types';

const latestVersionMode = CosmosDBv4ChangeFeedMode.LatestVersion;
const allVersionsAndDeletesMode = CosmosDBv4ChangeFeedMode.AllVersionsAndDeletes;
const pollDeliveryMode = ConnectorDeliveryMode.Poll;
const webhookDeliveryMode = ConnectorDeliveryMode.Webhook;
const singleEventCardinality = ConnectorCardinality.One;
const batchCardinality = ConnectorCardinality.Many;

void latestVersionMode;
void allVersionsAndDeletesMode;
void pollDeliveryMode;
void webhookDeliveryMode;
void singleEventCardinality;
void batchCardinality;
