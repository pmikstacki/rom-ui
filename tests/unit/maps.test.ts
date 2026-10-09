import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { captureMapResources } from '../../src/lib/maps/resources.ts';

test('map resources preserve exact identities and zero coordinates in detached snapshots',()=>{
  const point={id:'  α/resource?key#id  ',title:'<Resource>',longitude:0,latitude:0};
  const rows=captureMapResources([point]);
  assert.deepEqual(rows,[point]);
  assert.notEqual(rows[0],point);
  assert.ok(Object.isFrozen(rows));assert.ok(Object.isFrozen(rows[0]));
  point.title='Changed';assert.equal(rows[0].title,'<Resource>');
  assert.equal(captureMapResources([{...point,id:'__proto__'}])[0].id,'__proto__');
});

test('map resources reject duplicates, invalid coordinates and exceeded bounds instead of truncating',()=>{
  const point={id:'a',title:'A',longitude:18,latitude:50};
  assert.throws(()=>captureMapResources([point,point]),/Duplicate/);
  for(const longitude of [181,-181,NaN,Infinity])assert.throws(()=>captureMapResources([{...point,longitude}]),/coordinates/);
  for(const latitude of [91,-91,NaN,Infinity])assert.throws(()=>captureMapResources([{...point,latitude}]),/coordinates/);
  assert.throws(()=>captureMapResources([point],0),/limit/);
  assert.throws(()=>captureMapResources([point,{...point,id:'b'}],1),/limit/);
});
