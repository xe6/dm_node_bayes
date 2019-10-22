import * as _ from 'lodash';
const csv = require('csvtojson');

import { Processor } from "./Processor.class";

export class Parser {
    public static parseCSV = async (fileName: string) => {
        const res = await csv().fromFile(fileName);
        
        const newArr = _.chain(res)
            .groupBy("v1")
            .map((value, key) => ({ category: key, phrasesList: value.map(obj => Processor.cleanseData(obj.v2)) }))
            .value();
    
        return newArr;
    }
}