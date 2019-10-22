import { Processor } from './Processor.class'

export class ProbabilityFinder {
    public static async execute(phrase: string, category: string): Promise<number> {
        const wordsFromCategory = await Processor.getWordsFromCategory(category);
        const wordArr = phrase.split(" ");
        const wordsNotInCategory = Processor.getWordsNotInCategory(wordArr, wordsFromCategory);
        
        // full Q words in category
        // if all words in cateroy -> denominator = Q words
        // else denominator = Q words + word length that are not in category
        const wordsLengthFromCategory = wordsNotInCategory.length 
            ? wordsFromCategory.length + wordsNotInCategory.length
            : wordsFromCategory.length;
    
        // arr of numerators
        // if all words in cateroy -> numerator = numerator
        // else numerator = numerator + 1 
        const wordArrProbability = Processor.getWordArrProbability(wordArr, wordsFromCategory);
        const wordProbability = wordsNotInCategory.length 
        ? wordArrProbability
            .map(item => {
                const tmpValue: any = Object.values(item).find(x => x);
                const tmpKey: any = Object.keys(item).find(x => x);
                
                item[tmpKey] = tmpValue === 1 ? tmpValue : tmpValue + 1; 
                return item;
            })
        : wordArrProbability;
        
        return Processor.countProbabilityByBayes(wordProbability, wordsLengthFromCategory)
    }
}