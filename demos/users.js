import { invoke, state, transition, createMachine, interpret, reduce } from './machine.js';

const context = () => ({
  users: []
});

const wait = ms => ({ then(resolve) { setTimeout(resolve, ms) } });

async function loadUsers() {
  await wait(3000);
  return [
    { id: 1, name: 'Wilbur' },
    { id: 2, name: 'Matthew' },
    { id: 3, name: 'Anne' }
  ];
}

const machine = createMachine({
  idle: state(
    transition('fetch', 'loading')
  ),
  loading: invoke(loadUsers,
    transition('done', 'loaded',
      reduce((ctx, ev) => ({ ...ctx, users: ev.data }))
    )
  ),
  loaded: state()
}, context);

const service = interpret(machine, service => {
  let state = service.machine.current;
  switch(state) {
    case 'loading': {
      loadBtn.setAttribute('disabled', '');
      usersNode.innerHTML = `<span class="loading">Loading</span>`;
      break;
    }
    case 'loaded': {
      let { users } = service.context;
      usersNode.innerHTML = `
        <ul>
        ${users.map(user => `
          <li id="user-${user.id}">${user.name}</li>
        `).join('')}
        </ul>
      `;
      break;
    }
  }
});

const usersNode = document.querySelector('#users');
const loadBtn = document.querySelector('#load');
loadBtn.onclick = () => service.send('fetch');
