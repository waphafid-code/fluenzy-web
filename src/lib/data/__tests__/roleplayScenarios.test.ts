import { describe, it, expect } from 'vitest';
import {
  ROLEPLAY_SCENARIOS,
  getRoleplayScenariosByFilter,
  getRoleplayScenarioById,
  generateCustomRoleplayScenario,
} from '../roleplayScenarios';

describe('Micro-Roleplay Scenarios Repository (Scope 6)', () => {
  it('contains at least 4 authentic scenarios covering all learning goals', () => {
    expect(ROLEPLAY_SCENARIOS.length).toBeGreaterThanOrEqual(4);

    const goals = ROLEPLAY_SCENARIOS.map((s) => s.goal);
    expect(goals).toContain('travel');
    expect(goals).toContain('career');
    expect(goals).toContain('academic');
    expect(goals).toContain('social');
  });

  it('guarantees each scenario consists of exactly 2 turns to prevent cognitive fatigue', () => {
    ROLEPLAY_SCENARIOS.forEach((scenario) => {
      expect(scenario.turns.length).toBe(2);
      expect(scenario.turns[0].turnNumber).toBe(1);
      expect(scenario.turns[1].turnNumber).toBe(2);
    });
  });

  it('provides at least 3 bilingual scaffold hints (Help Me Say This) per conversational turn', () => {
    ROLEPLAY_SCENARIOS.forEach((scenario) => {
      scenario.turns.forEach((turn) => {
        expect(turn.hints.length).toBeGreaterThanOrEqual(3);
        turn.hints.forEach((hint) => {
          expect(hint.englishText.length).toBeGreaterThan(5);
          expect(hint.indonesianMeaning.length).toBeGreaterThan(5);
          expect(hint.phoneticFocus.length).toBeGreaterThan(5);
          expect(hint.chunkHighlight.length).toBeGreaterThan(3);
        });
      });
    });
  });

  it('filters scenarios correctly by goal and proficiency tier', () => {
    const careerScenarios = getRoleplayScenariosByFilter('career');
    expect(careerScenarios.length).toBeGreaterThanOrEqual(1);
    expect(careerScenarios.every((s) => s.goal === 'career')).toBe(true);

    const academicScenarios = getRoleplayScenariosByFilter('academic', 'B1');
    expect(academicScenarios.length).toBeGreaterThanOrEqual(1);
    expect(academicScenarios[0].tier).toBe('B1');
  });

  it('finds scenario by ID and returns undefined for unknown ID', () => {
    const cafe = getRoleplayScenarioById('roleplay-cafe-a1');
    expect(cafe).toBeDefined();
    expect(cafe?.title).toContain('Coffee Shop');

    const unknown = getRoleplayScenarioById('non-existent-id');
    expect(unknown).toBeUndefined();
  });

  it('menghasilkan skenario kustom prosedural untuk topik wawancara kerja dan sidang skripsi', () => {
    // 1. Uji skenario wawancara kerja
    const jobScenario = generateCustomRoleplayScenario({
      topic: 'Wawancara magang software engineer di Tokopedia',
      interlocutorRole: 'Lead Tech Interviewer',
    });
    expect(jobScenario.goal).toBe('career');
    expect(jobScenario.partnerRole).toBe('Lead Tech Interviewer');
    expect(jobScenario.turns.length).toBe(2);
    expect(jobScenario.turns[0].aiPrompt).toContain('introduce yourself');
    expect(jobScenario.turns[0].hints[0].englishText).toContain('software engineering');

    // 2. Uji skenario sidang skripsi
    const thesisScenario = generateCustomRoleplayScenario({
      topic: 'Ujian Sidang Skripsi Bab 4 Hasil Penelitian',
    });
    expect(thesisScenario.goal).toBe('academic');
    expect(thesisScenario.partnerRole).toContain('Penguji');
    expect(thesisScenario.turns[1].hints[0].englishText).toContain('paired samples t-test');

    // 3. Uji skenario umum bebas
    const genericScenario = generateCustomRoleplayScenario({
      topic: 'Diskusi rencana jalan-jalan keliling Kyoto',
    });
    expect(genericScenario.title).toContain('Kyoto');
    expect(genericScenario.turns.length).toBe(2);
  });
});

