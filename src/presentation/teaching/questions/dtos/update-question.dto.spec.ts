import { validate } from 'class-validator';
import { UpdateQuestionDto } from './update-question.dto';

describe('UpdateQuestionDto', () => {
  it('accepts an empty update body', async () => {
    expect(await validate(new UpdateQuestionDto())).toHaveLength(0);
  });

  it('accepts cheatingDetectionEnabled false', async () => {
    const dto = Object.assign(new UpdateQuestionDto(), {
      cheatingDetectionEnabled: false,
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects non-boolean cheatingDetectionEnabled', async () => {
    const dto = Object.assign(new UpdateQuestionDto(), {
      cheatingDetectionEnabled: 'no' as never,
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'cheatingDetectionEnabled')).toBe(true);
  });

  it('rejects unsupported type values', async () => {
    const dto = Object.assign(new UpdateQuestionDto(), {
      type: 'qcm' as never,
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'type')).toBe(true);
  });
});
