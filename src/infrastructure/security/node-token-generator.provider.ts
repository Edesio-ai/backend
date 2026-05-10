import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ITokenGeneratorProvider } from '../../domain/shared/security/contracts/i-token-generator.provider';

@Injectable()
export class NodeTokenGeneratorProvider implements ITokenGeneratorProvider {
  generateHex(bytes: number): string {
    return randomBytes(bytes).toString('hex');
  }
}
