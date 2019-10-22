import { ProbabilityFinder } from './classes/ProbabilityFinder.class';
import { Categories } from './enums/Categories.enum';

const main = async () => {
    const inputStr: string = process.argv[2];
    if (!inputStr) {
       console.error('Please input a string as a first param!\nExample: node parse.js string');
       process.exit(1);
    }
    const probabilities = await Promise.all([
        ProbabilityFinder.execute(inputStr.toLowerCase(), Categories.HAM),
        ProbabilityFinder.execute(inputStr.toLowerCase(), Categories.SPAM),
    ]);

    const [hamP, spamP] = probabilities
    return {
        hamP,
        spamP,
    }
}

main().then(res => {
    console.log(`Ham P: ${res.hamP}\nSpam P: ${res.spamP}`);  
    process.exit(0);
}).catch(err => console.error(err));
