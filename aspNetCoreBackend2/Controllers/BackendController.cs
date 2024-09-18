using Microsoft.AspNetCore.Mvc;
using Megagram.Data;
using Microsoft.EntityFrameworkCore;
using Megagram.Models;
using Amazon;
using Amazon.KeyManagementService;
using Amazon.KeyManagementService.Model;
using Amazon.Runtime;
using Megagram.Models.RequestBodies;
using System.Text;
using Newtonsoft.Json;

namespace Megagram.Controllers;


[ApiController]
[Route("/")]
public class BackendController : ControllerBase
{

    private readonly MegaDbContext _megaDbContext;
    private readonly IAmazonKeyManagementService _kmsClient;

    public BackendController(MegaDbContext megaDbContext)
    {
        _megaDbContext = megaDbContext;

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        var awsOptions = configuration.GetSection("AWS");
        var accessKey = awsOptions["AccessKey"];
        var secretKey = awsOptions["SecretKey"];
        var awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
        _kmsClient = new AmazonKeyManagementServiceClient(awsCredentials, RegionEndpoint.USEast1);
    }



    [HttpPost("addConvo")]
    public async Task<IActionResult> addNewConvo([FromBody] AddConvo addConvo) {
        if (addConvo == null) {
            return BadRequest("Invalid conversation data.");
        }
        
        var encryptedConvoTitle = "";
        var encryptedLatestMessage = "";
        var encryptedMembers = "";
        var encryptedConvoInitiator = "";
        var encryptedPromotedUsers = "";
        string keyId=addConvo.sessionKeyId;

        using (var convoTitleStream = new MemoryStream(Encoding.UTF8.GetBytes(addConvo.convoTitle))) {
            var encryptConvoTitleRequest = new EncryptRequest
            {
                KeyId = keyId,
                Plaintext = convoTitleStream
            };

            var encryptResponse = await _kmsClient.EncryptAsync(encryptConvoTitleRequest);
            var ciphertextBlob = encryptResponse.CiphertextBlob;
            encryptedConvoTitle = Convert.ToBase64String(ciphertextBlob.ToArray());
        }

        using (var latestMessageStream = new MemoryStream(Encoding.UTF8.GetBytes(addConvo.latestMessage))) {
            var encryptLatestMessageRequest = new EncryptRequest
            {
                KeyId = keyId,
                Plaintext = latestMessageStream
            };

            var encryptResponse = await _kmsClient.EncryptAsync(encryptLatestMessageRequest);
            var ciphertextBlob = encryptResponse.CiphertextBlob;
            encryptedLatestMessage = Convert.ToBase64String(ciphertextBlob.ToArray());
        }

        using (var membersStream = new MemoryStream(Encoding.UTF8.GetBytes(addConvo.members))) {
            var encryptMembersRequest = new EncryptRequest
            {
                KeyId = keyId,
                Plaintext = membersStream
            };

            var encryptResponse = await _kmsClient.EncryptAsync(encryptMembersRequest);
            var ciphertextBlob = encryptResponse.CiphertextBlob;
            encryptedMembers = Convert.ToBase64String(ciphertextBlob.ToArray());
        }

        using (var convoInitiatorStream = new MemoryStream(Encoding.UTF8.GetBytes(addConvo.convoInitiator))) {
            var encryptConvoInitiatorRequest = new EncryptRequest
            {
                KeyId = keyId,
                Plaintext = convoInitiatorStream
            };

            var encryptResponse = await _kmsClient.EncryptAsync(encryptConvoInitiatorRequest);
            var ciphertextBlob = encryptResponse.CiphertextBlob;
            encryptedConvoInitiator = Convert.ToBase64String(ciphertextBlob.ToArray());
        }

        using (var promotedUserStream = new MemoryStream(Encoding.UTF8.GetBytes(addConvo.promotedUsers))) {
            var encryptPromotedUsersRequest = new EncryptRequest
            {
                KeyId = keyId,
                Plaintext = promotedUserStream
            };

            var encryptResponse = await _kmsClient.EncryptAsync(encryptPromotedUsersRequest);
            var ciphertextBlob = encryptResponse.CiphertextBlob;
            encryptedPromotedUsers = Convert.ToBase64String(ciphertextBlob.ToArray());
        }


        Convo newConvo = new Convo
        {
            convoId = addConvo.convoId,
            convoTitle = encryptedConvoTitle,
            latestMessage = encryptedLatestMessage,
            isRequested = addConvo.isRequested,
            promotedUsers = encryptedPromotedUsers,
            members = encryptedMembers,
            convoInitiator = encryptedConvoInitiator,
            isMuted = addConvo.isMuted,
            hasUnreadMessage = addConvo.hasUnreadMessage,
            isDeleted = addConvo.isDeleted
        };

        _megaDbContext.convos.Add(newConvo);
        _megaDbContext.SaveChanges();

        return Ok(newConvo);
    }

    [HttpPost("addMessage")]
    public async Task<IActionResult> addNewMessage([FromBody] AddMessage addMessage) {
        if (addMessage == null) {
            return BadRequest("Invalid message data.");
        }

        var encryptedMessage = "";
        var encryptedSender = "";
        string keyId = "";

        if(addMessage.sessionKeyId.Length==0) {
            var createKeyRequest = new CreateKeyRequest
            {
                KeyUsage = KeyUsageType.ENCRYPT_DECRYPT,
            };
            var createKeyResponse = await _kmsClient.CreateKeyAsync(createKeyRequest);
            keyId = createKeyResponse.KeyMetadata.KeyId;
        }
        else {
            keyId = addMessage.sessionKeyId;
        }
            
        using (var messageStream = new MemoryStream(Encoding.UTF8.GetBytes(addMessage.message))) {
            var encryptMessageRequest = new EncryptRequest
            {
                KeyId = keyId,
                Plaintext = messageStream
            };

            var encryptResponse = await _kmsClient.EncryptAsync(encryptMessageRequest);
            var ciphertextBlob = encryptResponse.CiphertextBlob;
            encryptedMessage = Convert.ToBase64String(ciphertextBlob.ToArray());
        }

        using (var senderStream = new MemoryStream(Encoding.UTF8.GetBytes(addMessage.sender))) {
            var encryptSenderRequest = new EncryptRequest
            {
                KeyId = keyId,
                Plaintext = senderStream
            };

            var encryptResponse = await _kmsClient.EncryptAsync(encryptSenderRequest);
            var ciphertextBlob = encryptResponse.CiphertextBlob;
            encryptedSender = Convert.ToBase64String(ciphertextBlob.ToArray());
        }

        Message newMessage = new Message
        {
            messageId = addMessage.messageId,
            convoId = addMessage.convoId,
            message = encryptedMessage,
            sender = encryptedSender,
            messageSentAt = addMessage.messageSentAt,
        };

        _megaDbContext.messages.Add(newMessage);

        _megaDbContext.SaveChanges();

        return Ok(keyId);
    }


    [HttpDelete("deleteConvo/{convoId}")]
    public async Task<IActionResult> deleteConvo (string convoId)
    {
        if (!Guid.TryParse(convoId, out Guid parsedConvoId))
        {
            return BadRequest(false);
        }

        var convo = await _megaDbContext.convos
        .FirstOrDefaultAsync(cl => cl.convoId == parsedConvoId);

        if (convo != null)
        {
            _megaDbContext.convos.Remove(convo);
            
            var messages = await _megaDbContext.messages
            .Where(cl => cl.convoId == convoId)
            .ToListAsync();

            foreach (var message in messages)
            {
                _megaDbContext.messages.Remove(message);
            }

            await _megaDbContext.SaveChangesAsync();


            return Ok(true);
        }

        return NotFound(false);
    }

    [HttpDelete("deleteMessage/{messageId}")]
    public async Task<IActionResult> deleteMessage (string messageId)
    {
        if (!Guid.TryParse(messageId, out Guid parsedMessageId))
        {
            return BadRequest(false);
        }

        var message = await _megaDbContext.messages
        .FirstOrDefaultAsync(cl => cl.messageId == parsedMessageId);

        if (message != null)
        {
            _megaDbContext.messages.Remove(message);
            await _megaDbContext.SaveChangesAsync();

            return Ok(true);
        }

        return NotFound(false);
    }

    [HttpPatch("editConvo/{convoId}")]
    public async Task<IActionResult> editConvo (string convoId, [FromBody] ConvoEditRequestBody editedConvo)
    {
        if (!Guid.TryParse(convoId, out Guid parsedConvoId))
        {
            return BadRequest(false);
        }

        var convo = await _megaDbContext.convos
        .FirstOrDefaultAsync(cl => cl.convoId == parsedConvoId);

        if (convo != null)
        {
            var encryptedConvoTitle = "";
            var encryptedLatestMessage = "";
            var encryptedMembers = "";
            var encryptedConvoInitiator = "";
            var encryptedPromotedUsers = "";
            var keyId = "";
            

            if(editedConvo.sessionKeyId.Length==0) {
                var createKeyRequest = new CreateKeyRequest
                {
                    KeyUsage = KeyUsageType.ENCRYPT_DECRYPT,
                };
                var createKeyResponse = await _kmsClient.CreateKeyAsync(createKeyRequest);
                keyId = createKeyResponse.KeyMetadata.KeyId;
            }
            else {
                keyId = editedConvo.sessionKeyId;
            }

            using (var convoTitleStream = new MemoryStream(Encoding.UTF8.GetBytes(editedConvo.convoTitle))) {
                var encryptConvoTitleRequest = new EncryptRequest
                {
                    KeyId = keyId,
                    Plaintext = convoTitleStream
                };

                var encryptResponse = await _kmsClient.EncryptAsync(encryptConvoTitleRequest);
                var ciphertextBlob = encryptResponse.CiphertextBlob;
                encryptedConvoTitle = Convert.ToBase64String(ciphertextBlob.ToArray());
            }

            using (var latestMessageStream = new MemoryStream(Encoding.UTF8.GetBytes(editedConvo.latestMessage))) {
                var encryptLatestMessageRequest = new EncryptRequest
                {
                    KeyId = keyId,
                    Plaintext = latestMessageStream
                };

                var encryptResponse = await _kmsClient.EncryptAsync(encryptLatestMessageRequest);
                var ciphertextBlob = encryptResponse.CiphertextBlob;
                encryptedLatestMessage = Convert.ToBase64String(ciphertextBlob.ToArray());
            }

            using (var membersStream = new MemoryStream(Encoding.UTF8.GetBytes(editedConvo.members))) {
                var encryptMembersRequest = new EncryptRequest
                {
                    KeyId = keyId,
                    Plaintext = membersStream
                };

                var encryptResponse = await _kmsClient.EncryptAsync(encryptMembersRequest);
                var ciphertextBlob = encryptResponse.CiphertextBlob;
                encryptedMembers = Convert.ToBase64String(ciphertextBlob.ToArray());
            }

            using (var convoInitiatorStream = new MemoryStream(Encoding.UTF8.GetBytes(editedConvo.convoInitiator))) {
                var encryptConvoInitiatorRequest = new EncryptRequest
                {
                    KeyId = keyId,
                    Plaintext = convoInitiatorStream
                };

                var encryptResponse = await _kmsClient.EncryptAsync(encryptConvoInitiatorRequest);
                var ciphertextBlob = encryptResponse.CiphertextBlob;
                encryptedConvoInitiator = Convert.ToBase64String(ciphertextBlob.ToArray());
            }

            using (var promotedUserStream = new MemoryStream(Encoding.UTF8.GetBytes(editedConvo.promotedUsers))) {
                var encryptPromotedUsersRequest = new EncryptRequest
                {
                    KeyId = keyId,
                    Plaintext = promotedUserStream
                };

                var encryptResponse = await _kmsClient.EncryptAsync(encryptPromotedUsersRequest);
                var ciphertextBlob = encryptResponse.CiphertextBlob;
                encryptedPromotedUsers = Convert.ToBase64String(ciphertextBlob.ToArray());
            }

            convo.convoTitle = encryptedConvoTitle;
            convo.members = encryptedMembers;
            convo.convoInitiator = encryptedConvoInitiator;
            convo.latestMessage = encryptedLatestMessage;
            convo.promotedUsers = encryptedPromotedUsers;
            convo.isMuted = editedConvo.isMuted;
            convo.hasUnreadMessage = editedConvo.hasUnreadMessage;
            convo.isRequested = editedConvo.isRequested;
            convo.isDeleted = editedConvo.isDeleted;

            _megaDbContext.convos.Update(convo);
            await _megaDbContext.SaveChangesAsync();
            return Ok(keyId);
        }

        return NotFound(false);

    }



    [HttpGet("getAllConvos/{username}")]
    public async Task<IActionResult> getAllConvosOfUsername(string username)
    {
        var convos = await _megaDbContext.convos.ToListAsync();
        var filteredConvos = new List<Convo>();
        var decryptedMembers = "";
        foreach (var convo in convos)
        {
            var ciphertextBlob = Convert.FromBase64String(convo.members);

            var decryptRequest = new DecryptRequest
            {
                CiphertextBlob = new MemoryStream(ciphertextBlob)
            };

            var decryptResponse = await _kmsClient.DecryptAsync(decryptRequest);

            using (var reader = new StreamReader(decryptResponse.Plaintext, Encoding.UTF8))
            {
                decryptedMembers = reader.ReadToEnd();
            }

            string[][] decryptedMembersArray = JsonConvert.DeserializeObject<string[][]>(decryptedMembers);
            foreach(var decryptedMember in decryptedMembersArray)
            {
                if(decryptedMember[0] == username) {
                    filteredConvos.Add(convo);
                    break;
                }
            }
            

        }
        

        var decryptedConvos = new List<Convo>();
        var decryptedConvoTitle = "";
        var decryptedConvoInitiator = "";
        var decryptedLatestMessage = "";
        var decryptedPromotedUsers = "";
        
        foreach (var convo in filteredConvos)
        {
            var ciphertextBlob = Convert.FromBase64String(convo.convoTitle);

            var decryptRequest = new DecryptRequest
            {
                CiphertextBlob = new MemoryStream(ciphertextBlob)
            };

            var decryptResponse = await _kmsClient.DecryptAsync(decryptRequest);

            using (var reader = new StreamReader(decryptResponse.Plaintext, Encoding.UTF8))
            {
                decryptedConvoTitle = reader.ReadToEnd();
            }


            ciphertextBlob = Convert.FromBase64String(convo.members);

            decryptRequest = new DecryptRequest
            {
                CiphertextBlob = new MemoryStream(ciphertextBlob)
            };

            decryptResponse = await _kmsClient.DecryptAsync(decryptRequest);

            using (var reader = new StreamReader(decryptResponse.Plaintext, Encoding.UTF8))
            {
                decryptedMembers = reader.ReadToEnd();
            }

            ciphertextBlob = Convert.FromBase64String(convo.convoInitiator);

            decryptRequest = new DecryptRequest
            {
                CiphertextBlob = new MemoryStream(ciphertextBlob)
            };

            decryptResponse = await _kmsClient.DecryptAsync(decryptRequest);

            using (var reader = new StreamReader(decryptResponse.Plaintext, Encoding.UTF8))
            {
                decryptedConvoInitiator = reader.ReadToEnd();
            }

            ciphertextBlob = Convert.FromBase64String(convo.latestMessage);

            decryptRequest = new DecryptRequest
            {
                CiphertextBlob = new MemoryStream(ciphertextBlob)
            };

            decryptResponse = await _kmsClient.DecryptAsync(decryptRequest);

            using (var reader = new StreamReader(decryptResponse.Plaintext, Encoding.UTF8))
            {
                decryptedLatestMessage = reader.ReadToEnd();
            }

            ciphertextBlob = Convert.FromBase64String(convo.promotedUsers);

            decryptRequest = new DecryptRequest
            {
                CiphertextBlob = new MemoryStream(ciphertextBlob)
            };

            decryptResponse = await _kmsClient.DecryptAsync(decryptRequest);

            using (var reader = new StreamReader(decryptResponse.Plaintext, Encoding.UTF8))
            {
                decryptedPromotedUsers = reader.ReadToEnd();
            }


            decryptedConvos.Add(
                new Convo {
                    convoId = convo.convoId,
                    convoTitle = decryptedConvoTitle,
                    latestMessage = decryptedLatestMessage,
                    isRequested = convo.isRequested,
                    promotedUsers = decryptedPromotedUsers,
                    members = decryptedMembers,
                    convoInitiator = decryptedConvoInitiator,
                    isMuted = convo.isMuted,
                    hasUnreadMessage = convo.hasUnreadMessage,
                    isDeleted = convo.isDeleted
                }
            );
        }

        return Ok(decryptedConvos);
    }

    [HttpGet("getMessagesForConvo/{convoId}")]
    public async Task<IActionResult> GetMessagesForConvo(string convoId)
    {
        var messages = await _megaDbContext.messages
            .Where(cl => cl.convoId == convoId)
            .OrderBy(cl => cl.messageSentAt)
            .ToListAsync();

        var decryptedMessages = new List<Message>();

        foreach (var message in messages)
        {
            var ciphertextBlob = Convert.FromBase64String(message.sender);
            var decryptRequest = new DecryptRequest
            {
                CiphertextBlob = new MemoryStream(ciphertextBlob)
            };
            var decryptResponse = await _kmsClient.DecryptAsync(decryptRequest);
            string decryptedSender;
            using (var reader = new StreamReader(decryptResponse.Plaintext, Encoding.UTF8))
            {
                decryptedSender = reader.ReadToEnd();
            }


            ciphertextBlob = Convert.FromBase64String(message.message);
            decryptRequest = new DecryptRequest
            {
                CiphertextBlob = new MemoryStream(ciphertextBlob)
            };
            decryptResponse = await _kmsClient.DecryptAsync(decryptRequest);
            string decryptedMessage;
            using (var reader = new StreamReader(decryptResponse.Plaintext, Encoding.UTF8))
            {
                decryptedMessage = reader.ReadToEnd();
            }

            decryptedMessages.Add(
                new Message
                {
                    messageId = message.messageId,
                    convoId = message.convoId,
                    message = decryptedMessage,
                    sender = decryptedSender,
                    messageSentAt = message.messageSentAt,
                }
            );
        }

        return Ok(decryptedMessages);
    }

    [HttpDelete("deleteMessageReactionsOfMessage/{messageId}")]
    public async Task<IActionResult> deleteMessageReactionsOfMessage(string messageId) {
        var messageReactions = await _megaDbContext.messageReactions
        .Where(cl => cl.messageId == messageId).ToListAsync();

        foreach (var messageReaction in messageReactions)
        {
            _megaDbContext.messageReactions.Remove(messageReaction);
            await _megaDbContext.SaveChangesAsync();
        }

        return Ok(true);
    }

    [HttpGet("getAllMessageReactions")]
    public async Task<IActionResult> getAllMessageReactions() {
        var messageReactions = await _megaDbContext.messageReactions.ToListAsync();

        return Ok(messageReactions);
    }



}
