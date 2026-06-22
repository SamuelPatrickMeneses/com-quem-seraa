/// <reference path="../pb_data/types.d.ts" />
onBootstrap((e) => {
    console.log("Seed: Hook onBootstrap disparado.");

    // IMPORTANTE: Permitir a inicialização do PocketBase antes de qualquer acesso ao DB
    e.next();

    let isDev = false;
    try {
        // Tenta acessar variáveis de ambiente de forma resiliente
        const env = (typeof $os !== "undefined" && $os.getenv) ? $os.getenv("APP_ENV") : "";
        isDev = (env === "dev");
        if (isDev) {
            $app.db().newQuery("DELETE FROM group_participants").execute()
            $app.db().newQuery("DELETE FROM groups").execute()
            $app.db().newQuery("DELETE FROM users").execute()
        }
        console.log("Seed: APP_ENV detectado como:", env);
    } catch (err) {
        console.log("Seed: Erro ao detectar ambiente:", err);
        return;
    }

    if (!isDev) {
        console.log("Seed: Ambiente não é 'dev'. Pulando...");
        return;
    }

    try {
        const usersCollection = $app.findCollectionByNameOrId("users");
        const groupsCollection = $app.findCollectionByNameOrId("groups");
        const participantsCollection = $app.findCollectionByNameOrId("group_participants");

        if (!groupsCollection || !participantsCollection) {
            console.log("Seed: Coleções 'groups' ou 'group_participants' ainda não existem.");
            return;
        }


        const testUserEmails = ["ana@exemplo.com", "beto@exemplo.com", "caio@exemplo.com"];
        const userIds = [];


        for (const email of testUserEmails) {
            // Se chegou aqui, o usuário não existe. Cria um novo.
            const record = new Record(usersCollection);
            record.set("email", email);
            record.set("name", email.split("@")[0]);
            record.set("password", "1234567890");
            record.set("verified", true);
            $app.save(record);
            userIds.push(record.id);
        }

        // Verifica se já existe um grupo criado por esses usuários
        const groupRecord = new Record(groupsCollection);
        groupRecord.set("name", "Amigo Secreto 2024");
        groupRecord.set("created_by", userIds[0]);
        groupRecord.set("participants_count", 3);
        $app.save(groupRecord);

        for (const userId of userIds) {
            const partRecord = new Record(participantsCollection);
            partRecord.set("group_id", groupRecord.id);
            partRecord.set("giver_id", userId);
            $app.save(partRecord);
        }

        const drawnGroupRecord = new Record(groupsCollection);
        drawnGroupRecord.set("name", "Sorteio Realizado 2024");
        drawnGroupRecord.set("created_by", userIds[0]);
        drawnGroupRecord.set("participants_count", 3);
        drawnGroupRecord.set("has_been_drawn", true);
        $app.save(drawnGroupRecord);

        const drawnParticipantIds = [];
        for (const userId of userIds) {
            const partRecord = new Record(participantsCollection);
            partRecord.set("group_id", drawnGroupRecord.id);
            partRecord.set("giver_id", userId);
            $app.save(partRecord);
            drawnParticipantIds.push({ record: partRecord, userId });
        }

        drawnParticipantIds[0].record.set("receiver_id", drawnParticipantIds[1].userId);
        drawnParticipantIds[1].record.set("receiver_id", drawnParticipantIds[2].userId);
        drawnParticipantIds[2].record.set("receiver_id", drawnParticipantIds[0].userId);
        for (const item of drawnParticipantIds) {
            $app.save(item.record);
        }

        console.log("Seed: Sucesso na inserção dos dados de teste!");
    } catch (err) {
        console.error("Seed Erro Detalhado:", err);
    }
})


const env = (typeof $os !== "undefined" && $os.getenv) ? $os.getenv("APP_ENV") : "";
if (env === "dev") {
    routerAdd("GET", "/api/test/reseed", (e) => {
        try {
            $app.db().newQuery("DELETE FROM group_participants").execute()
            $app.db().newQuery("DELETE FROM groups").execute()
            $app.db().newQuery("DELETE FROM users").execute()

            const usersCollection = $app.findCollectionByNameOrId("users");
            const groupsCollection = $app.findCollectionByNameOrId("groups");
            const participantsCollection = $app.findCollectionByNameOrId("group_participants");

            if (!groupsCollection || !participantsCollection) {
                console.log("Seed: Coleções 'groups' ou 'group_participants' ainda não existem.");
                return e.json(500, {message: "Coleções necessárias não encontradas."});
            }

            const testUserEmails = ["ana@exemplo.com", "beto@exemplo.com", "caio@exemplo.com"];
            const userIds = [];

            for (const email of testUserEmails) {
                const record = new Record(usersCollection);
                record.set("email", email);
                record.set("name", email.split("@")[0]);
                record.set("password", "1234567890");
                record.set("verified", true);
                $app.save(record);
                userIds.push(record.id);
            }

            const groupRecord = new Record(groupsCollection);
            groupRecord.set("name", "Amigo Secreto 2024");
            groupRecord.set("created_by", userIds[0]);
            groupRecord.set("participants_count", 3);
            $app.save(groupRecord);

            for (const userId of userIds) {
                const partRecord = new Record(participantsCollection);
                partRecord.set("group_id", groupRecord.id);
                partRecord.set("giver_id", userId);
                $app.save(partRecord);
            }

            const drawnGroupRecord = new Record(groupsCollection);
            drawnGroupRecord.set("name", "Sorteio Realizado 2024");
            drawnGroupRecord.set("created_by", userIds[0]);
            drawnGroupRecord.set("participants_count", 3);
            drawnGroupRecord.set("has_been_drawn", true);
            $app.save(drawnGroupRecord);

            const drawnParticipantIds = [];
            for (const userId of userIds) {
                const partRecord = new Record(participantsCollection);
                partRecord.set("group_id", drawnGroupRecord.id);
                partRecord.set("giver_id", userId);
                $app.save(partRecord);
                drawnParticipantIds.push({ record: partRecord, userId });
            }

            drawnParticipantIds[0].record.set("receiver_id", drawnParticipantIds[1].userId);
            drawnParticipantIds[1].record.set("receiver_id", drawnParticipantIds[2].userId);
            drawnParticipantIds[2].record.set("receiver_id", drawnParticipantIds[0].userId);
            for (const item of drawnParticipantIds) {
                $app.save(item.record);
            }

            return e.json(200, {message: "Seed: dados de teste recarregados com sucesso!"});
        } catch (err) {
            return e.json(500, {message: "Seed: erro ao recarregar dados de teste.", error: String(err)});
        }
    });
}

