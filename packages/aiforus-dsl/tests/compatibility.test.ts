import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import {
  ACTION_TYPES,
  DSL_VERSION,
  PPT_ELEMENT_TYPES,
  SCENE_TYPES,
  migrate,
  normalizeScene,
  validateAction,
  validateScene,
  validateStage,
} from '@aiforus/dsl';
import { generateSchema } from '../scripts/gen-schema.mjs';

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), 'utf8'));

const stage = fixture('openmaic-d8a0081-stage.json');
const slideScene = fixture('openmaic-d8a0081-slide-scene.json') as {
  content: { canvas: { elements: Array<{ type: string }> } };
  actions: Array<{ type: string }>;
};
const quizScene = fixture('openmaic-d8a0081-quiz-scene.json');

const expectedSchemaHashes = {
  Action: 'e91b51f719f8d50b926d64e5d92ff62bb39f681f7bb5ba7a16a44769c1bcdae4',
  SerializedScene: 'd9606b57994b213df55c54b031c4c5f60fcb7427e07be2d6ef384dc93c25ca53',
  Stage: '4ca9543c8f9e5524590ec2e08c7b468ec5da16d38fcf3dba4d7adfc8423b26f0',
} as const;

const hashSchema = (schema: unknown): string =>
  createHash('sha256')
    .update(`${JSON.stringify(schema, null, 2)}\n`)
    .digest('hex');

describe('OpenMAIC d8a0081 compatibility fixtures', () => {
  it('passes the dependency-free validators and generated schemas', () => {
    expect(validateStage(stage)).toEqual({ valid: true });
    expect(validateScene(slideScene)).toEqual({ valid: true });
    expect(validateScene(quizScene)).toEqual({ valid: true });

    const ajv = new Ajv({ allErrors: true, strict: false });
    expect(ajv.compile(generateSchema('Stage'))(stage)).toBe(true);
    const validateSerializedScene = ajv.compile(generateSchema('SerializedScene'));
    expect(validateSerializedScene(slideScene)).toBe(true);
    expect(validateSerializedScene(quizScene)).toBe(true);
    const validateSerializedAction = ajv.compile(generateSchema('Action'));
    for (const action of slideScene.actions) {
      expect(validateAction(action)).toEqual({ valid: true });
      expect(validateSerializedAction(action)).toBe(true);
    }
  });

  it('covers every frozen element, action, and scene discriminant', () => {
    expect(slideScene.content.canvas.elements.map(({ type }) => type)).toEqual(PPT_ELEMENT_TYPES);
    expect(slideScene.actions.map(({ type }) => type)).toEqual(ACTION_TYPES);
    expect(SCENE_TYPES).toEqual(['slide', 'quiz', 'interactive', 'pbl']);
  });

  it('normalizes and JSON-round-trips without losing serialized fields', () => {
    const normalized = normalizeScene(slideScene);
    expect(JSON.parse(JSON.stringify(normalized))).toEqual(slideScene);
    expect(slideScene).not.toHaveProperty('dslVersion');

    const migrated = migrate(slideScene) as Record<string, unknown>;
    expect(migrated.dslVersion).toBe(DSL_VERSION);
    expect(slideScene).not.toHaveProperty('dslVersion');
  });
});

describe('frozen JSON Schema output', () => {
  for (const [root, expectedHash] of Object.entries(expectedSchemaHashes)) {
    it(`${root} is deterministic and byte-compatible with OpenMAIC d8a0081`, () => {
      const first = generateSchema(root);
      const second = generateSchema(root);
      expect(second).toEqual(first);
      expect(hashSchema(first)).toBe(expectedHash);
    });
  }
});
