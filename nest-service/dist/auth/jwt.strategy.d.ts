import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private userModel;
    constructor(config: ConfigService, userModel: Model<any>);
    validate(payload: {
        id: string;
    }): Promise<any>;
}
export {};
