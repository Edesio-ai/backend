import { TeacherErrorFilter } from './teacher.filter';
import { TeacherSessionsNotFoundError } from '../../domain/teaching/error';

describe('TeacherFilter', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should map TeachingError to http response', () => {
    const exception = fixtures.givenTeachingError();

    fixtures.whenCatch(exception);

    fixtures.thenStatusCalledWith(exception.httpStatus);
    fixtures.thenJsonCalledWith({
      code: exception.code,
      message: exception.message,
    });
  });
});

class Fixtures {
  public readonly teacherFilter: TeacherErrorFilter;
  private readonly jsonMock = jest.fn();
  private readonly statusMock = jest.fn(() => ({ json: this.jsonMock }));

  constructor() {
    this.teacherFilter = new TeacherErrorFilter();
  }

  givenTeachingError() {
    return new TeacherSessionsNotFoundError('sessions query failed');
  }

  whenCatch(exception: TeacherSessionsNotFoundError) {
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: this.statusMock,
        }),
      }),
    } as any;

    this.teacherFilter.catch(exception, host);
  }

  thenStatusCalledWith(httpStatus: number) {
    expect(this.statusMock).toHaveBeenCalledWith(httpStatus);
    expect(this.statusMock).toHaveBeenCalledTimes(1);
  }

  thenJsonCalledWith(payload: { code: string; message: string }) {
    expect(this.jsonMock).toHaveBeenCalledWith(payload);
    expect(this.jsonMock).toHaveBeenCalledTimes(1);
  }
}
