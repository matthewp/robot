import { invoke, state, transition, createMachine, interpret, reduce } from './machine.js';

const context = () => ({
  users: []
});

async function loadUsers() {
  return [
    { id: 1, name: 'Wilbur' },
    { id: 2, name: 'Matthew' },
    { id: 3, name: 'Anne' }
  ]
}

const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
  ),
  loading: invoke(loadUsers, 'loaded'),
  loaded: state()
}, context);

const usersNode = document.querySelector('#users');