import { prisma } from '../db';

const COUNTRIES = ['Netherlands', 'India', 'Germany', 'Spain', 'United Kingdom', 'France', 'Italy'];
const EMPLOYMENT_TYPES = ['EOR', 'PEO', 'Contractor'];
const FILLER_WORDS = /\b(create|contract|for|an|a|in|the|please|make|start|new|with|of)\b/gi;

export interface ParsedPrompt {
  name: string;
  country: string;
  empType: string;
}

// Ports parseAIContractPrompt() from js/pages.js — rule-based, no LLM.
export function parsePrompt(text: string): ParsedPrompt {
  let name = text || '';
  let country = '';
  let empType = '';

  for (const c of COUNTRIES) {
    const re = new RegExp(`\\b${c}\\b`, 'i');
    if (re.test(name)) {
      country = c;
      name = name.replace(re, '');
    }
  }
  for (const t of EMPLOYMENT_TYPES) {
    const re = new RegExp(`\\b${t}\\b`, 'i');
    if (re.test(name)) {
      empType = t;
      name = name.replace(re, '');
    }
  }
  name = name.replace(FILLER_WORDS, '').replace(/[,]/g, ' ').replace(/\s+/g, ' ').trim();

  return { name, country, empType };
}

// Ports findExistingEmployee() — exact match, then substring match either direction.
export async function findExistingEmployee(name: string) {
  if (!name) return null;
  const q = name.toLowerCase().trim();
  if (!q) return null;

  const employees = await prisma.employee.findMany();
  return (
    employees.find((e) => e.name.toLowerCase() === q) ||
    employees.find((e) => e.name.toLowerCase().includes(q) || q.includes(e.name.toLowerCase())) ||
    null
  );
}
