import { ProbabilityFinder } from './classes/ProbabilityFinder.class';
import { Categories } from './enums/Categories.enum';

const main = async () => {
    const str = 'Go free fine just eat slice';
    const probabilities = await Promise.all([
        ProbabilityFinder.execute(str, Categories.HAM),
        ProbabilityFinder.execute(str, Categories.SPAM),
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
})

