/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates) {
  // ensure candidates array
  const candList = Array.isArray(candidates) ? candidates.slice() : [];
  const votes = {}; // candidateId -> count
  const registered = new Set();
  const hasVoted = new Set();

  function registerVoter(voter) {
    if (!voter || typeof voter !== 'object') return false;
    const { id, age } = voter;
    if (!id || typeof id !== 'string') return false;
    if (registered.has(id)) return false;
    if (typeof age !== 'number' || age < 18) return false;
    registered.add(id);
    return true;
  }

  function castVote(voterId, candidateId, onSuccess, onError) {
    // validation
    if (!registered.has(voterId)) {
      return onError && onError('voter not registered');
    }
    if (hasVoted.has(voterId)) {
      return onError && onError('already voted');
    }
    const candidate = candList.find((c) => c.id === candidateId);
    if (!candidate) {
      return onError && onError('invalid candidate');
    }
    // record vote
    votes[candidateId] = (votes[candidateId] || 0) + 1;
    hasVoted.add(voterId);
    return onSuccess && onSuccess({ voterId, candidateId });
  }

  function getResults(sortFn) {
    const results = candList.map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      votes: votes[c.id] || 0,
    }));
    if (typeof sortFn === 'function') {
      return results.slice().sort(sortFn);
    }
    // default sort by votes desc
    return results.slice().sort((a, b) => b.votes - a.votes);
  }

  function getWinner() {
    const res = getResults();
    if (res.length === 0 || res[0].votes === 0) return null;
    return res[0];
  }

  return {
    registerVoter,
    castVote,
    getResults,
    getWinner,
  };
}

export function createVoteValidator(rules) {
  const minAge = rules && typeof rules.minAge === 'number' ? rules.minAge : 0;
  const required = Array.isArray(rules && rules.requiredFields) ? rules.requiredFields : [];
  return function (voter) {
    if (!voter || typeof voter !== 'object') {
      return { valid: false, reason: 'invalid voter object' };
    }
    // check required fields
    for (const field of required) {
      if (!(field in voter)) {
        return { valid: false, reason: `missing field ${field}` };
      }
    }
    if (typeof voter.age !== 'number' || voter.age < minAge) {
      return { valid: false, reason: 'age below minimum' };
    }
    return { valid: true };
  };
}

export function countVotesInRegions(regionTree) {
  if (!regionTree || typeof regionTree !== 'object') return 0;
  const self = typeof regionTree.votes === 'number' ? regionTree.votes : 0;
  const subs = Array.isArray(regionTree.subRegions)
    ? regionTree.subRegions.reduce((sum, sub) => sum + countVotesInRegions(sub), 0)
    : 0;
  return self + subs;
}

export function tallyPure(currentTally, candidateId) {
  const base = currentTally && typeof currentTally === 'object' ? currentTally : {};
  const result = { ...base };
  if (typeof candidateId !== 'string' || candidateId === '') return result;
  result[candidateId] = (result[candidateId] || 0) + 1;
  return result;
}
