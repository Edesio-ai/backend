import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { TokenGeneratorProvider } from '../../interfaces/security/token-generator.provider';

@Injectable()
export class NodeTokenGeneratorProvider implements TokenGeneratorProvider {
  generateHex(bytes: number): string {
    return randomBytes(bytes).toString('hex');
  }
}
