import type { Interfaces } from '../../types';
import type { ProtocolIdentifiers } from '../../types/enums';

export default class Protocol implements Interfaces.LegacyProtocol {
  id: ProtocolIdentifiers.LegacyAutomation;

  name: string;

  slug: string;

  version: string;

  fullName: string;

  #versionSeparator = '__';

  constructor(args: { id: ProtocolIdentifiers.LegacyAutomation }) {
    this.id = args.id;

    this.name = this.getName();
    this.slug = this.getSlug();
    this.version = this.getVersion();
    this.fullName = this.getFullName();
  }

  private hasVersion() {
    return this.id.indexOf(this.#versionSeparator) !== -1;
  }

  private splitId() {
    return this.id.split(this.#versionSeparator);
  }

  /**
   * @dev See naming convention at ProtocolIdentifiers declaration
   */
  private getVersion() {
    return this.hasVersion() ? this.splitId().reverse()[0] : '';
  }

  private getName() {
    return this.hasVersion() ? this.splitId()[0] : this.id;
  }

  private getSlug() {
    return this.name.split(' ').join('-').toLowerCase();
  }

  private getFullName() {
    return this.hasVersion() ? `${this.name} ${this.version}` : this.name;
  }
}