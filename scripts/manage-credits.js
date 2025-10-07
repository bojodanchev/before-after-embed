#!/usr/bin/env node
/**
 * Utility script to manage client credits
 * Usage:
 *   node scripts/manage-credits.js list
 *   node scripts/manage-credits.js add-bonus <clientId> <amount>
 *   node scripts/manage-credits.js check-avtograph
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load production environment variables
dotenv.config({ path: resolve(__dirname, '../.env.production') });

import {
  listClients,
  getClientByEmail,
  getMonthlyUsageForClient,
  getMonthlyBonusForClient,
  incrMonthlyBonusForClient,
  getClientPlan,
  listEmbedsForClient
} from '../api/_shared.js';

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

async function main() {
  if (command === 'list') {
    console.log('=== All Clients ===\n');
    const clients = await listClients();
    for (const client of clients) {
      const plan = await getClientPlan(client.id);
      const usage = await getMonthlyUsageForClient(client.id);
      const bonus = await getMonthlyBonusForClient(client.id);
      const embeds = await listEmbedsForClient(client.id);
      const remaining = plan.monthlyGenerations + bonus - usage;
      console.log(`Client: ${client.id}`);
      console.log(`  Email: ${client.email || 'N/A'}`);
      console.log(`  Plan: ${plan.name} (${plan.monthlyGenerations} generations/month)`);
      console.log(`  Usage this month: ${usage}`);
      console.log(`  Bonus credits: ${bonus}`);
      console.log(`  Remaining: ${remaining}`);
      console.log(`  Embeds: ${embeds.length}`);
      embeds.forEach(e => console.log(`    - ${e.id} (${e.name || 'Unnamed'})`));
      console.log('');
    }
  } else if (command === 'add-bonus') {
    if (!arg1 || !arg2) {
      console.error('Usage: node scripts/manage-credits.js add-bonus <clientId> <amount>');
      process.exit(1);
    }
    const clientId = arg1;
    const amount = parseInt(arg2, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      console.error('Amount must be a positive number');
      process.exit(1);
    }
    console.log(`Adding ${amount} bonus credits to client ${clientId}...`);
    const newBonus = await incrMonthlyBonusForClient(clientId, amount);
    console.log(`✓ New bonus total: ${newBonus}`);
  } else if (command === 'check-avtograph') {
    console.log('=== Checking Avtograph Embeds ===\n');
    const clients = await listClients();
    const avtographClients = clients.filter(c =>
      c.email && c.email.toLowerCase().includes('avtograph')
    );

    if (avtographClients.length === 0) {
      console.log('No Avtograph clients found. Searching by embed name/id...\n');
      // Check all clients for avtograph in their embed names
      for (const client of clients) {
        const embeds = await listEmbedsForClient(client.id);
        const avtographEmbeds = embeds.filter(e =>
          e.id?.toLowerCase().includes('avtograph') ||
          e.name?.toLowerCase().includes('avtograph')
        );
        if (avtographEmbeds.length > 0) {
          const plan = await getClientPlan(client.id);
          const usage = await getMonthlyUsageForClient(client.id);
          const bonus = await getMonthlyBonusForClient(client.id);
          const remaining = plan.monthlyGenerations + bonus - usage;

          console.log(`Found client with Avtograph embeds: ${client.id}`);
          console.log(`  Email: ${client.email || 'N/A'}`);
          console.log(`  Plan: ${plan.name}`);
          console.log(`  Credits remaining: ${remaining}`);
          console.log(`  Avtograph embeds:`);
          avtographEmbeds.forEach(e => {
            console.log(`    - ${e.id} (${e.name || 'Unnamed'})`);
          });
          console.log('');
        }
      }
    } else {
      for (const client of avtographClients) {
        const plan = await getClientPlan(client.id);
        const usage = await getMonthlyUsageForClient(client.id);
        const bonus = await getMonthlyBonusForClient(client.id);
        const embeds = await listEmbedsForClient(client.id);
        const remaining = plan.monthlyGenerations + bonus - usage;

        console.log(`Client: ${client.id}`);
        console.log(`  Email: ${client.email}`);
        console.log(`  Plan: ${plan.name}`);
        console.log(`  Credits remaining: ${remaining}`);
        console.log(`  Embeds: ${embeds.length}`);
        embeds.forEach(e => {
          console.log(`    - ${e.id} (${e.name || 'Unnamed'})`);
        });

        if (remaining < 10) {
          console.log(`  ⚠️  Low credits! Adding 10 bonus credits...`);
          await incrMonthlyBonusForClient(client.id, 10);
          const newBonus = await getMonthlyBonusForClient(client.id);
          const newRemaining = plan.monthlyGenerations + newBonus - usage;
          console.log(`  ✓ New bonus: ${newBonus}, New remaining: ${newRemaining}`);
        } else {
          console.log(`  ✓ Credits sufficient (${remaining} remaining)`);
        }
        console.log('');
      }
    }
  } else {
    console.log('Usage:');
    console.log('  node scripts/manage-credits.js list');
    console.log('  node scripts/manage-credits.js add-bonus <clientId> <amount>');
    console.log('  node scripts/manage-credits.js check-avtograph');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
