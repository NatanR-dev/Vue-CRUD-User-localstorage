<template>
    <div>
        <h1>Olá, {{account.user.fullName}}!</h1>
        <p>Bem-vindo, você foi logado com sucesso!</p>
        <!-- Recebe os usuários fazendo a requisição no fake-backend. -->
        <h3>Dados:</h3>
        <em v-if="users.loading">Carregando Usuários...</em>
        <span v-if="users.error" class="text-danger">ERROR: {{users.error}}</span>
        <ul v-if="users.items">
            <li v-for="user in users.items" :key="user.id">Nome:
                {{user.fullName}}
                <span v-if="user.deleting"><em> - Excluindo...</em></span>
                <span v-else-if="user.deleteError" class="text-danger"> - ERROR: {{user.deleteError}}</span>
                <span v-else> - <a @click="deleteUser(user.id)" class="text-danger"><i class="fa fa-user-times" aria-hidden="true"></i></a></span>

                <li v-for="user in users.items" :key="user.id">CPF:
                {{user.cpf}}
                <li v-for="user in users.items" :key="user.id">Tel:
                {{user.tel}}
                <li v-for="user in users.items" :key="user.id">Email:
                {{user.email}}

            </li>
        </ul>
        <p>
            <router-link to="/login"><i class="fa fa-power-off" style="color:#4b4c46;" aria-hidden="true"> Sair</i></router-link>
        </p>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
    computed: {
        ...mapState({
            account: state => state.account,
            users: state => state.users.all
        })
    },
    created () {
        this.getAllUsers();
    },
    methods: {
        ...mapActions('users', {
            getAllUsers: 'getAll',
            deleteUser: 'delete'
        })
    }
};
</script>