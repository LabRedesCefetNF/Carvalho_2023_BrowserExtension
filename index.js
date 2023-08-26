
function Consulta() {
    const padraoCNPJ = /([0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2})/;
    const padraoCEP = /([0-9]{2}\.?[0-9]{3}\-?[0-9]{3})/;
    const padraoData = /([0-9]{2}\/[0-9]{2}\/[0-9]{4})/gm;
    const baseDiasConfiaveisCriacaoDominio = 1.825;
       
        async function resultado() {

            var url = window.location.href;
            url = url.replace('http://',"");
            url = url.replace('https://',"");
            
            try {

                const whoisJSON = await buscarInformacoesWhoIs(url);

                // alert(JSON.stringify(whoisJSON.events[0]));

                // await fetch('http://localhost:3000/whois',{method:'POST',body:JSON.stringify(whoisJSON), headers:{'Content-Type':'application/json'}});
                var cnpj = retornaCnpjWhois(whoisJSON);

                const receitaJSON = await buscarInformacoesAPIReceita ( cnpj );
                
                // alert(receitaJSON.logradouro);
                // await fetch('http://localhost:3000/receita',{method:'POST',body:JSON.stringify(receitaJSON), headers:{'Content-Type':'application/json'}});

                function montaJson(whoisJSON,receitaJSON){

                    whois = whoisJSON;
                    receita = receitaJSON;
                    var json = {
                       dominio:'',
                       criacao_dominio: null,
                       ultima_alteracao: null, 
                       vencimento: null,
                       data_situacao: null,
                       cnpj: null,
                       cnpj_ativo:false,
                       telefone: null,
                       email:'',
                       endereco: {
                        logradouro:'',
                        numero:'',
                        cep:'',
                        municipio:'',
                        uf:''
                       }

                    };
                    criacao = whois.events[0].eventDate.split('T');
                    alteracao = whois.events[1].eventDate.split('T');
                    vencimento = whois.events[2].eventDate.split('T');

                    json.dominio = whois.handle;
                    json.criacao_dominio = criacao[0];
                    json.ultima_alteracao = alteracao[0];
                    json.vencimento = vencimento[0];
                    json.data_situacao = receita.data_situacao;
                    json.cnpj = retornaCnpjWhois(whois);
                    json.cnpj_ativo = receita.situacao == 'ATIVA'? true : false;
                    json.telefone = receita.telefone;
                    json.email = receita.email;
                    json.endereco.logradouro = receita.logradouro;
                    json.endereco.numero = receita.numero;
                    json.endereco.cep = receita.cep;
                    json.endereco.municipio = receita.municipio;
                    json.endereco.uf = receita.uf;
                   
                    // alert(JSON.stringify(json));
                    
                    return json;
                }
                var json = montaJson(whoisJSON,receitaJSON);

                await fetch('https://192.168.67.105:8080/resultado',{method:'POST',body:JSON.stringify(json), headers:{'Content-Type':'application/json'}});

            } catch ( err ) {     

            }
        }

        resultado();

            async function buscarInformacoesAPIReceita( cnpj ) {
                const cnpjSemPontosETracos = cnpj.replace(/[^\d]+/g, "");
                try {
                    let response = await fetch(`https://192.168.67.105:3000/receita/${cnpjSemPontosETracos}`, {
                        "method": "GET",
                        "headers": {
                            "Content-Type": "application/json"
                        }
                    });

                    return await response.json();
                } catch ( error ) {
                    throw new Error( 'CNPJ não encontrado.' );
                }
            }

            function retornaCnpjWhois(json){
                var obj = json;
                publicIds = obj.entities[0].publicIds;
                // publicIds.forEach(id => {
                //     if (id.type == "cnpj"){
                //         return id.identifier;
                //     }
                // });
                //verificar pq nao retorna corretamente
                return publicIds[0].identifier;
            }

            async function buscarInformacoesWhoIs (  url ) {
                try {
                    let response = await fetch(`https://192.168.67.105:3000/whois/${url}`, {
                        "method": "GET",
                        "headers": {
                            "Content-Type": "application/json"
                        } 
                    });
                    return await response.json();
                } catch ( error ) {
                    throw new Error( 'Domínio não encontrado.' );
                }

            }

        }
        Consulta();

