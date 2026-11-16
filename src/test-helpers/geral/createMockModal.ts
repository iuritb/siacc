
import { Subject } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

export function createNgbModalRefMock() {
  const closedSubject = new Subject<any>();

  const modalRefMock = {
    componentInstance: {},
    close: jest.fn(),
    dismiss: jest.fn(),
    closed: closedSubject.asObservable(),
    result: Promise.resolve(),
  } as unknown as NgbModalRef;

  return { modalRefMock, closedSubject };
}
