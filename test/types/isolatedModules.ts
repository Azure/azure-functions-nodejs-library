// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Cardinality, CosmosDBv4ChangeFeedMode, DeliveryMode } from '../../types';

const latestVersionMode = CosmosDBv4ChangeFeedMode.LatestVersion;
const allVersionsAndDeletesMode = CosmosDBv4ChangeFeedMode.AllVersionsAndDeletes;
const pollDeliveryMode = DeliveryMode.Poll;
const webhookDeliveryMode = DeliveryMode.Webhook;
const singleEventCardinality = Cardinality.One;
const batchCardinality = Cardinality.Many;

void latestVersionMode;
void allVersionsAndDeletesMode;
void pollDeliveryMode;
void webhookDeliveryMode;
void singleEventCardinality;
void batchCardinality;
