const test = require('node:test');
const assert = require('node:assert/strict');

function strip(value){ return String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, ''); }
function token(value){ return strip(value).toUpperCase().replace(/[-'.]/g,' ').replace(/[^A-Z0-9 ]/g,'').replace(/\s+/g,' ').trim(); }
function key(nom, prenom, birthDate){ return `${token(nom)} ${token(prenom)}${birthDate ? ` ${birthDate}` : ''}`; }
function uniqueMatches(sources, targets){
  const used = new Set();
  return sources.reduce((matches, source)=>{
    const candidate = targets.find(target => key(source.nom,source.prenom,source.birthDate) === key(target.nom,target.prenom,target.birthDate));
    if(candidate && !used.has(candidate.id)){ used.add(candidate.id); matches.push([source.id,candidate.id]); }
    return matches;
  },[]);
}

test('la normalisation est insensible aux accents, casse et tirets', () => {
  assert.equal(key('Dùpont','Anne-Marie','20120103'), key('DUPONT','ANNE MARIE','20120103'));
});

test('une cible ne peut pas être appariée deux fois', () => {
  const matches = uniqueMatches(
    [{id:'6a',nom:'Martin',prenom:'Léa',birthDate:'20120502'},{id:'6b',nom:'Martin',prenom:'Léa',birthDate:'20120502'}],
    [{id:'4a',nom:'MARTIN',prenom:'LEA',birthDate:'20120502'}]
  );
  assert.deepEqual(matches,[['6a','4a']]);
});

test('des dates différentes ne sont pas assimilées', () => {
  assert.notEqual(key('Roux','Noé','20120101'), key('Roux','Noé','20120102'));
});
