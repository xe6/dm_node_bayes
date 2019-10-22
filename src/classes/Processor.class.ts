const sw = require('stopword');
import * as _ from 'lodash';

/* Stop list */
import { STOP_WORD_LIST, CSV_FILE_NAME } from '../constants'
import { Parser } from './Parser.class';
export class Processor {
    public static cleanseData(str: any) {
        // cast to lower case
        const lowerCaseString = str.toLowerCase();
        // regexp for numbers
        const withNoDigits = lowerCaseString.replace(/[0-9]/g, '');
        // regexp for special characters
        const withNoSpecCharacters = withNoDigits.replace(/[^a-zA-Z ]/g, "").split(" ");  
        // removing stopwords
        const withNoStopwords = sw.removeStopwords(withNoSpecCharacters, STOP_WORD_LIST).join(" ");
        
        return withNoStopwords.toLowerCase();
    }


    /*
        Get all words from category
    */
    public static async getWordsFromCategory(category: string) {
        console.log()
        const jsonCSV = await Parser.parseCSV('../input_data/data.csv');
        const categoryList = jsonCSV.find((categoryList) => categoryList.category === category);
        const words = categoryList.phrasesList.join(" ").split(" ");
        return words;
    }

    public static getWordsNotInCategory(searchArr: string[], categoryWords: string[]) {
        const wordsNotInCategory = searchArr.filter(word => !categoryWords.includes(word));
        
        return wordsNotInCategory;
    }

    public static getWordArrProbability(wordArr: string[], categoryWords: string[]){
        const countedWords = wordArr
            .map((word) => {
                const wordProbability = categoryWords.reduce((acc: any, curr: any) => { 
                    if(!curr) return acc;
                    
                    if (curr === word) {
                        if (curr in acc) {
                            acc[curr]++;
                        } else {
                            acc[curr] = 1;
                        }
                    } 
    
                    return acc;
                }, {});
                
                wordProbability[word] = _.isEmpty(wordProbability) ? 1 : wordProbability[word];
                
                return wordProbability;
            });
    
        return countedWords;
    }

    public static countProbabilityByBayes(wordProbability: any[], denominator: number): number {
        const wordProbabilityValues = wordProbability.map(item => Object.values(item).find(x => x));
        const probability = wordProbabilityValues
            .reduce((acc: number, val: number) => acc * (val / denominator), 1);
    
        return probability as number;
    }
}