import { RepositoryRegistery } from './repository.register';
import { ServiceRegistery } from './service.register';

export class DependencyInjection {
  static registerAll():void {
    ServiceRegistery.registerService();
    RepositoryRegistery.registerRepository();
  }
}
