
Object.defineProperty(exports, "__esModule", { value: true });
import { initAuthCreds, BufferJSON, WAProto } from '@adiwajshing/baileys'
exports.initAuthCreds = initAuthCreds;
import { AuthWA } from '../../models'

const KEY_MAP: any = {
    'pre-key': 'preKeys',
    'session': 'sessions',
    'sender-key': 'senderKeys',
    'app-state-sync-key': 'appStateSyncKeys',
    'app-state-sync-version': 'appStateVersions',
    'sender-key-memory': 'senderKeyMemory'
};

const authWAService = async (userWA: string | string[] | undefined) => {
    let authWA: any;
    let creds: any;
    let keys: any;
    let callSaveTimes = 0
    
    const foundAuthWA = await AuthWA.findOne({ userWA })
    
    if (foundAuthWA) {
        authWA = foundAuthWA
        const result = JSON.parse(authWA.authCreds, BufferJSON.reviver);
        creds = result.creds;
        keys = {};
    } else {
        const createdAuthWA = await AuthWA.create({
            userWA,
            authCreds: JSON.stringify({ creds: {}, keys: {} }, BufferJSON.replacer, 2)
        })
        authWA = createdAuthWA
        creds = exports.initAuthCreds();
        keys = {};
    }
   
    const saveState = async () => {
        callSaveTimes += 1
        console.log('=============> authWA.save called times:', callSaveTimes)
        authWA.authCreds = JSON.stringify({ creds }, BufferJSON.replacer, 2)
        await authWA.save()
    };
  
    return {
        state: {
            creds,
            keys: {
                get: (type: any, ids: any) => {
                    const key = KEY_MAP[type];
                    return ids.reduce((dict: any, id: any) => {
                        var _a;
                        let value = (_a = keys[key]) === null || _a === void 0 ? void 0 : _a[id];
                        if (value) {
                            if (type === 'app-state-sync-key') {
                                // @ts-ignore
                                value = WAProto.proto.AppStateSyncKeyData.fromObject(value);
                            }
                            dict[id] = value;
                        }
                        return dict;
                    }, {});
                },
                set: (data: any) => {
                    for (const _key in data) {
                        const key = KEY_MAP[_key];
                        keys[key] = keys[key] || {};
                        Object.assign(keys[key], data[_key]);
                    }
                    // saveState();
                }
            }
        },
        saveState
    };
};
export { authWAService }

