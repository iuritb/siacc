
É necessário o envio, via CNAB , do consolidado diário, ou seja, do retorno contendo todas as REC, COBR, incluídos, aceitos, rejeitados ou cancelados, bem como os agendamentos concluídos.

O envio deve ocorrer no dia posterior ao movimento, de preferência à partir das 00:01h

Essa opção é para clientes que trabalham com arquivo.

A mensagem consolidada deverá refletir exclusivamente o status final de cada ocorrência ao término do dia, não sendo necessário informar todas as transições de status pelas quais ela passou durante o processamento.
 
Exemplo:
Considerando que, no dia 30/09, ocorreram as seguintes movimentações:
• 50 agendamentos foram criados, dos quais 25 permaneceram criados e 25 foram rejeitados até o final do dia;
• 100 autorizações foram aprovadas, das quais 50 permaneceram aprovadas e 50 foram canceladas ao longo do dia.
Na madrugada de 31/09, deverá ser disponibilizado para o recebedor apenas o resultado consolidado da posição final das ocorrências, informando:
• 25 agendamentos com status Rejeitado;
• 50 autorizações com status Aprovado;
• 50 autorizações com status Cancelado.

Dessa forma, o processo não deverá transmitir o histórico completo de alterações de status ocorridas durante o dia, mas apenas o último status vigente de cada agendamento e autorização na data de processamento.

Segue em anexo os leiautes dos arquivos retorno do REC/SOLICREC, COBR ( leiaute retorno)


Geração do consolidado diário

• O sistema deve gerar diariamente um arquivo CNAB contendo o consolidado do movimento do dia.

• O consolidado deve refletir exclusivamente dados efetivamente atualizados na data de referência.

Conteúdo do arquivo CNAB

• O arquivo deve conter todas as autorizações e cobranças do cliente, conforme a última situação do dia.

 Disponibilização do arquivo

• O arquivo CNAB consolidado deve ser disponibilizado ao cliente no batch/na madrugada do dia seguinte, com data de movimento do dia (dia anterior) em que os registros apresentam as datas em que foram atualizados. 

Ex. No dia 17 o agendamento foi atualizado para concluído. No batch do dia 18 será informada essa atualização com data de movimento do dia 17. 

 • Em caso de ausência de movimentação, o sistema não gera arquivo.

Consolidado de todas as remessas enviadas no dia.

 No consolidado deve ser enviado o último status.

Aqueles que foram incluídos no dia, mas não sofreram alterações de status, também devem ser enviados no consolidado.
